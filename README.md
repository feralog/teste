# Quiz Template - Guia de Uso

Este é um template de quiz que permite criar questionários para diferentes matérias, bastando trocar os arquivos JSON de questões.

## Estrutura do Projeto

- `index.html` - Página principal do quiz
- `css/styles.css` - Estilos do quiz
- `js/config.js` - Configurações personalizáveis
- `js/data.js` - Gerenciamento de dados e carregamento das questões
- `js/app.js` - Lógica principal do aplicativo
- `questoes_modulo1.json`, `questoes_modulo2.json` - Arquivos de exemplo com questões

## Como Personalizar

### 1. Configuração Básica

Edite o arquivo `js/config.js` para personalizar:

- **Título do Quiz**: Altere o valor da propriedade `title` para o nome da sua matéria
- **Chave de Armazenamento**: Altere o valor da propriedade `storageKey` para evitar conflitos com outros quizzes
- **Módulos**: Configure a lista de módulos disponíveis, cada um com:
  - `id`: Identificador único do módulo
  - `name`: Nome exibido na interface
  - `file`: Nome do arquivo JSON (sem a extensão .json)

### 2. Criação de Arquivos de Questões

Crie arquivos JSON seguindo o formato dos exemplos:

```json
[
  {
    "question": "Texto da pergunta",
    "options": [
      "Opção 1",
      "Opção 2",
      "Opção 3",
      "Opção 4",
      "Opção 5"
    ],
    "correctIndex": 2,
    "explanation": "Explicação da resposta correta",
    "type": "conteudista"
  },
  ...
]
```

Onde:
- `question`: Texto da pergunta
- `options`: Array com as alternativas
- `correctIndex`: Índice da alternativa correta (começando em 0)
- `explanation`: Explicação da resposta
- `type`: Tipo da questão ("conteudista" ou "raciocínio")

### 3. Adicionando Novos Módulos

1. Crie um novo arquivo JSON com suas questões (ex: `questoes_novo_modulo.json`)
2. Adicione o módulo na configuração em `js/config.js`:

```javascript
modules: [
    // Módulos existentes...
    {
        id: "novo_modulo",
        name: "Nome do Novo Módulo",
        file: "questoes_novo_modulo"
    }
]
```

## Hospedagem no GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos do template
3. Ative o GitHub Pages nas configurações do repositório
4. Seu quiz estará disponível em `https://seu-usuario.github.io/nome-do-repositorio/`

## Personalização Avançada

- **Cores**: Edite o arquivo CSS para alterar as cores do quiz
- **Funcionalidades**: Modifique os arquivos JS para adicionar novas funcionalidades

## Limitações

- O template não inclui funcionalidade de revisão espaçada
- A troca de arquivos JSON deve ser feita manualmente no código
