/**
 * config.js - Configurações do quiz
 * 
 * Este arquivo contém as configurações personalizáveis do quiz.
 * Altere estas configurações para adaptar o quiz à sua matéria.
 */

// Configuração do quiz
const quizConfig = {
    // Título principal que aparece na tela de login
    title: "Quiz Template",
    
    // Nome do localStorage para salvar os dados do usuário
    storageKey: "quizTemplateData",
    
    // Lista de módulos disponíveis
    // O nome do arquivo deve corresponder ao valor em 'file' (sem a extensão .json)
    modules: [
        {
            id: "modulo1",
            name: "Módulo 1",
            file: "questoes_modulo1"
        },
        {
            id: "modulo2",
            name: "Módulo 2",
            file: "questoes_modulo2"
        },
        // Adicione mais módulos conforme necessário
    ]
};
