/**
 * app.js - Lógica principal do aplicativo de quiz
 * 
 * Este arquivo contém a lógica principal do aplicativo, incluindo:
 * - Gerenciamento de telas e navegação
 * - Lógica do quiz (perguntas, respostas, pontuação)
 * - Timer e progresso
 */

// Variáveis globais
let currentUser = '';
let currentModule = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let quizStartTime = null;
let quizTimer = null;
let quizSeconds = 0;

// Elementos DOM
const screens = {
    login: document.getElementById('login-screen'),
    moduleSelection: document.getElementById('module-selection-screen'),
    quiz: document.getElementById('quiz-screen'),
    results: document.getElementById('results-screen')
};

// Inicialização
document.addEventListener('DOMContentLoaded', init);

/**
 * Inicializa o aplicativo
 */
async function init() {
    try {
        // Define o título do quiz
        document.getElementById('quiz-subject-title').textContent = quizConfig.title;
        document.title = quizConfig.title;
        
        // Carrega as questões
        await loadAllQuestions();
        console.log('Questões carregadas com sucesso');
        
        // Tenta carregar dados do usuário
        if (loadUserData()) {
            currentUser = getUsername();
            showModuleSelectionScreen();
        } else {
            showLoginScreen();
        }
        
        // Configura os event listeners
        setupEventListeners();
        
        // Popula a lista de módulos
        populateModuleList();
        
    } catch (error) {
        console.error('Erro ao inicializar o aplicativo:', error);
        alert('Ocorreu um erro ao carregar o aplicativo. Por favor, recarregue a página.');
    }
}

/**
 * Popula a lista de módulos na tela de seleção
 */
function populateModuleList() {
    const moduleList = document.getElementById('module-list');
    moduleList.innerHTML = '';
    
    quizConfig.modules.forEach(module => {
        const button = document.createElement('button');
        button.className = 'list-group-item list-group-item-action module-btn';
        button.dataset.module = module.id;
        
        const progress = calculateModuleProgress(module.id);
        
        button.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${module.name}</span>
                <span class="badge bg-primary rounded-pill module-progress" data-module="${module.id}">${progress}%</span>
            </div>
        `;
        
        button.addEventListener('click', () => startQuiz(module.id));
        
        moduleList.appendChild(button);
    });
}

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Module selection
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Quiz
    document.getElementById('quit-quiz-btn').addEventListener('click', quitQuiz);
    document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
    
    // Results
    document.getElementById('retry-module-btn').addEventListener('click', () => startQuiz(currentModule));
    document.getElementById('return-to-modules-btn').addEventListener('click', showModuleSelectionScreen);
    
    // Configura o salvamento automático
    window.addEventListener('beforeunload', saveUserData);
}

/**
 * Manipula o envio do formulário de login
 * @param {Event} event - Evento de submit
 */
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    
    if (username) {
        currentUser = username;
        setUsername(username);
        showModuleSelectionScreen();
    }
}

/**
 * Manipula o logout do usuário
 */
function handleLogout() {
    if (confirm('Tem certeza que deseja sair? Seu progresso está salvo.')) {
        currentUser = '';
        showLoginScreen();
    }
}

/**
 * Mostra a tela de login
 */
function showLoginScreen() {
    hideAllScreens();
    screens.login.classList.remove('d-none');
    document.getElementById('username').value = currentUser;
}

/**
 * Mostra a tela de seleção de módulos
 */
function showModuleSelectionScreen() {
    hideAllScreens();
    screens.moduleSelection.classList.remove('d-none');
    
    // Atualiza o nome do usuário
    document.getElementById('user-display').textContent = currentUser;
    
    // Atualiza o progresso dos módulos
    updateModuleProgress();
}

/**
 * Atualiza o progresso exibido para cada módulo
 */
function updateModuleProgress() {
    // Atualiza o progresso de cada módulo
    document.querySelectorAll('.module-progress').forEach(element => {
        const module = element.dataset.module;
        const progress = calculateModuleProgress(module);
        element.textContent = `${progress}%`;
        
        // Atualiza a cor baseada no progresso
        if (progress >= 80) {
            element.classList.remove('bg-primary', 'bg-warning');
            element.classList.add('bg-success');
        } else if (progress >= 40) {
            element.classList.remove('bg-primary', 'bg-success');
            element.classList.add('bg-warning');
        } else {
            element.classList.remove('bg-warning', 'bg-success');
            element.classList.add('bg-primary');
        }
    });
    
    // Atualiza o progresso geral
    const overallProgress = calculateOverallProgress();
    document.getElementById('overall-progress').textContent = `${overallProgress}%`;
    document.getElementById('overall-progress-bar').style.width = `${overallProgress}%`;
    
    // Atualiza a cor do progresso geral
    const progressBar = document.getElementById('overall-progress-bar');
    if (overallProgress >= 80) {
        progressBar.className = 'progress-bar bg-success';
    } else if (overallProgress >= 40) {
        progressBar.className = 'progress-bar bg-warning';
    } else {
        progressBar.className = 'progress-bar bg-primary';
    }
}

/**
 * Inicia o quiz para um módulo específico
 * @param {string} module - ID do módulo
 */
function startQuiz(module) {
    currentModule = module;
    
    // Obtém as questões do módulo
    currentQuestions = getModuleQuestions(module);
    
    // REMOVIDO: Embaralha as questões
    // shuffleArray(currentQuestions);
    // Agora as questões ficam na ordem exata do arquivo JSON
    
    // Reinicia as variáveis do quiz
    currentQuestionIndex = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    
    // Mostra a tela do quiz
    showQuizScreen();
    
    // Inicia o timer
    startTimer();
    
    // Carrega a primeira questão
    loadQuestion();
}

/**
 * Mostra a tela do quiz
 */
function showQuizScreen() {
    hideAllScreens();
    screens.quiz.classList.remove('d-none');
    
    // Define o título do quiz
    const moduleConfig = quizConfig.modules.find(m => m.id === currentModule);
    const title = moduleConfig ? moduleConfig.name : currentModule;
    
    document.getElementById('quiz-title').textContent = title;
    
    // Reinicia o contador de respostas
    document.getElementById('correct-count').textContent = `Corretas: 0`;
    document.getElementById('incorrect-count').textContent = `Incorretas: 0`;
}

/**
 * Carrega uma questão
 */
function loadQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResultsScreen();
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    displayQuestion(question);
    
    // Atualiza o número da questão
    document.getElementById('question-number').textContent = `Questão ${currentQuestionIndex + 1}/${currentQuestions.length}`;
    
    // Atualiza o tipo da questão
    document.getElementById('question-type').textContent = question.type === 'conteudista' ? 'Conteudista' : 'Raciocínio';
    
    // Atualiza a barra de progresso
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('quiz-progress').style.width = `${progress}%`;
}

/**
 * Exibe uma questão na tela
 * @param {Object} question - Objeto da questão
 */
function displayQuestion(question) {
    // Exibe o texto da questão
    document.getElementById('question-text').textContent = question.question;
    
    // Limpa o container de opções
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // Adiciona as opções
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-secondary w-100 option-btn';
        button.dataset.option = index;
        button.dataset.index = index;
        button.textContent = option;
        
        button.addEventListener('click', () => handleAnswer(index));
        
        optionsContainer.appendChild(button);
    });
    
    // Esconde o container de explicação
    document.getElementById('explanation-container').classList.add('d-none');
    
    // Mostra o container de questão
    document.getElementById('question-container').classList.remove('d-none');
}

/**
 * Manipula a resposta do usuário
 * @param {number} selectedIndex - Índice da opção selecionada
 */
function handleAnswer(selectedIndex) {
    // Obtém a questão atual
    const question = currentQuestions[currentQuestionIndex];
    const correctIndex = question.correctIndex;
    const isCorrect = selectedIndex === correctIndex;
    
    // Atualiza o contador de respostas
    if (isCorrect) {
        correctAnswers++;
        document.getElementById('correct-count').textContent = `Corretas: ${correctAnswers}`;
    } else {
        incorrectAnswers++;
        document.getElementById('incorrect-count').textContent = `Incorretas: ${incorrectAnswers}`;
    }
    
    // Marca as opções como corretas ou incorretas
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(button => {
        const index = parseInt(button.dataset.index);
        
        if (index === correctIndex) {
            button.classList.add('correct');
        } else if (index === selectedIndex) {
            button.classList.add('incorrect');
        }
        
        // Desabilita todos os botões
        button.disabled = true;
    });
    
    // Mostra a explicação
    document.getElementById('explanation-text').textContent = question.explanation;
    document.getElementById('explanation-container').classList.remove('d-none');
    
    // Adiciona efeito de pulse ao container de explicação
    document.getElementById('explanation-container').classList.add('pulse');
    setTimeout(() => {
        document.getElementById('explanation-container').classList.remove('pulse');
    }, 500);
    
    // Atualiza o progresso da questão
    updateQuestionProgress(currentModule, currentQuestionIndex, isCorrect);
}

/**
 * Avança para a próxima questão
 */
function nextQuestion() {
    // Avança para a próxima questão
    currentQuestionIndex++;
    
    // Carrega a próxima questão
    loadQuestion();
}

/**
 * Abandona o quiz atual e volta para a seleção de módulos
 */
function quitQuiz() {
    if (confirm('Tem certeza que deseja sair do quiz? Seu progresso será salvo.')) {
        stopTimer();
        showModuleSelectionScreen();
    }
}

/**
 * Mostra a tela de resultados
 */
function showResultsScreen() {
    stopTimer();
    hideAllScreens();
    screens.results.classList.remove('d-none');
    
    // Calcula a pontuação
    const totalQuestions = correctAnswers + incorrectAnswers;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // Atualiza os elementos da tela de resultados
    document.getElementById('score-percentage').textContent = `${scorePercentage}%`;
    document.getElementById('final-correct-count').textContent = correctAnswers;
    document.getElementById('final-incorrect-count').textContent = incorrectAnswers;
    document.getElementById('total-time').textContent = formatTime(quizSeconds);
    
    // Gera a análise de desempenho
    generatePerformanceAnalysis(scorePercentage);
    
    // Atualiza a cor do círculo de pontuação
    const scoreCircle = document.getElementById('score-circle');
    if (scorePercentage >= 80) {
        scoreCircle.style.borderColor = '#198754'; // Verde
    } else if (scorePercentage >= 60) {
        scoreCircle.style.borderColor = '#ffc107'; // Amarelo
    } else if (scorePercentage >= 40) {
        scoreCircle.style.borderColor = '#fd7e14'; // Laranja
    } else {
        scoreCircle.style.borderColor = '#dc3545'; // Vermelho
    }
}

/**
 * Gera uma análise de desempenho baseada na pontuação
 * @param {number} scorePercentage - Porcentagem de acertos
 */
function generatePerformanceAnalysis(scorePercentage) {
    const analysisContainer = document.getElementById('performance-analysis');
    let analysisText = '';
    
    if (scorePercentage >= 90) {
        analysisText = 'Excelente! Você domina este conteúdo.';
    } else if (scorePercentage >= 80) {
        analysisText = 'Muito bom! Você tem um bom conhecimento deste conteúdo.';
    } else if (scorePercentage >= 70) {
        analysisText = 'Bom! Você está no caminho certo, mas ainda pode melhorar.';
    } else if (scorePercentage >= 60) {
        analysisText = 'Regular. Recomendamos revisar este conteúdo novamente.';
    } else if (scorePercentage >= 40) {
        analysisText = 'Atenção! Você precisa estudar mais este conteúdo.';
    } else {
        analysisText = 'Você precisa dedicar mais tempo ao estudo deste conteúdo.';
    }
    
    analysisContainer.textContent = analysisText;
}

/**
 * Esconde todas as telas
 */
function hideAllScreens() {
    Object.values(screens).forEach(screen => {
        screen.classList.add('d-none');
    });
}

/**
 * Inicia o timer do quiz
 */
function startTimer() {
    quizStartTime = new Date();
    quizSeconds = 0;
    
    // Atualiza o timer a cada segundo
    quizTimer = setInterval(() => {
        quizSeconds++;
        document.getElementById('timer').innerHTML = `<i class="fas fa-clock me-1"></i>${formatTime(quizSeconds)}`;
    }, 1000);
}

/**
 * Para o timer do quiz
 */
function stopTimer() {
    clearInterval(quizTimer);
}

/**
 * Formata o tempo em segundos para o formato MM:SS
 * @param {number} seconds - Tempo em segundos
 * @returns {string} Tempo formatado
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Embaralha um array (algoritmo Fisher-Yates)
 * @param {Array} array - Array a ser embaralhado
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
