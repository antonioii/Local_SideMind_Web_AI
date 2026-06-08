import type { LanguageCode } from "../types";

export interface UiStrings {
  theme: string;
  light: string;
  dark: string;
  darkSun: string;
  language: string;
  memory: string;
  memoryPlaceholder: string;
  resume: string;
  save: string;
  minimize: string;
  trustPrompt: string;
  trustAccept: string;
  trustDeny: string;
  trustAcceptCompact: string;
  trustDenyCompact: string;
  terminalReady: string;
  messagePlaceholder: string;
  reset: string;
  copy: string;
  send: string;
  copyright: string;
  footerTip: string;
  modelUnavailable: string;
  modelReady: string;
  modelNotInstalled: string;
  environmentStatus: string;
  greeting: string;
  greetingLoaded: string;
  greetingDenied: string;
  transcriptPrefix: string;
  transcriptCopied: string;
  pageContextDisabled: string;
  loadingPage: string;
  pageReady: string;
  pageUnavailable: string;
  loadingFile: string;
  loadingAnswer: string;
  sessionReset: string;
  attachedFile: string;
  processingImage: string;
  imageReady: string;
  memoryResumeFailed: string;
  promptFailed: string;
  modelNotWorking: string;
}

const DEFAULT_MEMORY = "You are a local LLM assistant running inside a chrome extension";

const STRINGS: Record<LanguageCode, UiStrings> = {
  en: {
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    darkSun: "Dark Sun",
    language: "Lang",
    memory: "Memory",
    memoryPlaceholder: DEFAULT_MEMORY,
    resume: "Resume",
    save: "Save",
    minimize: "Minimize",
    trustPrompt:
      "Do you trust this page? The content will be copied as context to your model conversation. Malicious websites can try to manipulate it.",
    trustAccept: "Trust page and load context",
    trustDeny: "Do not load page context",
    trustAcceptCompact: "Trust and read HTML",
    trustDenyCompact: "Do not trust",
    terminalReady: "Ready.",
    messagePlaceholder: "Ask something about the page or your files",
    reset: "Reset",
    copy: "Copy",
    send: "Send",
    copyright: "Copyright © Local SideMind.",
    footerTip:
      "Tip: Local LLMs can make mistakes. Review code carefully and never execute anything you do not understand or do not trust.",
    modelUnavailable: "not working",
    modelReady: "ready",
    modelNotInstalled: "not installed",
    environmentStatus: "Local browser assistant",
    greeting: "Hello, how can I help you today?",
    greetingLoaded: "Hello, how can I help you today? I've read the page you are in.",
    greetingDenied: "Hello, how can I help you today? I didn't access your page content.",
    transcriptPrefix: "This was a conversation with a previous instance of yourself:",
    transcriptCopied: "Transcript copied.",
    pageContextDisabled: "Page context disabled for this session.",
    loadingPage: "Loading page context...",
    pageReady: "Page context ready.",
    pageUnavailable: "Page context unavailable.",
    loadingFile: "Loading file, wait...",
    loadingAnswer: "Loading answer...",
    sessionReset: "Session reset. Ready.",
    attachedFile: "Attached",
    processingImage: "Processing image OCR",
    imageReady: "Image OCR ready",
    memoryResumeFailed: "Memory resume failed.",
    promptFailed: "Prompt failed.",
    modelNotWorking: "Model not working."
  },
  "pt-BR": {
    theme: "Tema",
    light: "Claro",
    dark: "Escuro",
    darkSun: "Sol Escuro",
    language: "Idioma",
    memory: "Memória",
    memoryPlaceholder: DEFAULT_MEMORY,
    resume: "Resumir",
    save: "Salvar",
    minimize: "Minimizar",
    trustPrompt:
      "Você confia nesta página? O conteúdo será copiado como contexto para a conversa com o modelo. Sites maliciosos podem tentar manipulá-lo.",
    trustAccept: "Confiar na página e carregar contexto",
    trustDeny: "Não carregar contexto da página",
    trustAcceptCompact: "Confiar e ler o HTML",
    trustDenyCompact: "Não confiar",
    terminalReady: "Pronto.",
    messagePlaceholder: "Pergunte algo sobre a página ou seus arquivos",
    reset: "Limpar",
    copy: "Copiar",
    send: "Enviar",
    copyright: "Copyright © Local SideMind.",
    footerTip:
      "Dica: LLMs locais podem errar. Revise o código com cuidado e nunca execute algo que você não entenda ou em que não confie.",
    modelUnavailable: "sem resposta",
    modelReady: "pronto",
    modelNotInstalled: "não instalado",
    environmentStatus: "Assistente local do navegador",
    greeting: "Olá, como posso ajudar você hoje?",
    greetingLoaded: "Olá, como posso ajudar você hoje? Eu li a página em que você está.",
    greetingDenied: "Olá, como posso ajudar você hoje? Eu não acessei o conteúdo da sua página.",
    transcriptPrefix: "Esta foi uma conversa com uma instância anterior de você:",
    transcriptCopied: "Transcrição copiada.",
    pageContextDisabled: "Contexto da página desativado nesta sessão.",
    loadingPage: "Carregando contexto da página...",
    pageReady: "Contexto da página pronto.",
    pageUnavailable: "Contexto da página indisponível.",
    loadingFile: "Carregando arquivo, aguarde...",
    loadingAnswer: "Carregando resposta...",
    sessionReset: "Sessão limpa. Pronto.",
    attachedFile: "Anexado",
    processingImage: "Processando OCR da imagem",
    imageReady: "OCR da imagem pronto",
    memoryResumeFailed: "Falha ao resumir a memória.",
    promptFailed: "Falha ao gerar resposta.",
    modelNotWorking: "Modelo sem resposta."
  },
  es: {
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    darkSun: "Sol Oscuro",
    language: "Idioma",
    memory: "Memoria",
    memoryPlaceholder: DEFAULT_MEMORY,
    resume: "Resumir",
    save: "Guardar",
    minimize: "Minimizar",
    trustPrompt:
      "¿Confías en esta página? El contenido se copiará como contexto para tu conversación con el modelo. Los sitios maliciosos pueden intentar manipularlo.",
    trustAccept: "Confiar en la página y cargar contexto",
    trustDeny: "No cargar contexto de la página",
    trustAcceptCompact: "Confiar y leer el HTML",
    trustDenyCompact: "No confiar",
    terminalReady: "Listo.",
    messagePlaceholder: "Pregunta algo sobre la página o tus archivos",
    reset: "Limpiar",
    copy: "Copiar",
    send: "Enviar",
    copyright: "Copyright © Local SideMind.",
    footerTip:
      "Consejo: Los LLM locales pueden equivocarse. Revisa el código con cuidado y nunca ejecutes nada que no entiendas o en lo que no confíes.",
    modelUnavailable: "sin respuesta",
    modelReady: "listo",
    modelNotInstalled: "no instalado",
    environmentStatus: "Asistente local del navegador",
    greeting: "Hola, ¿cómo puedo ayudarte hoy?",
    greetingLoaded: "Hola, ¿cómo puedo ayudarte hoy? He leído la página en la que estás.",
    greetingDenied: "Hola, ¿cómo puedo ayudarte hoy? No accedí al contenido de tu página.",
    transcriptPrefix: "Esta fue una conversación con una instancia anterior de ti:",
    transcriptCopied: "Transcripción copiada.",
    pageContextDisabled: "Contexto de página desactivado para esta sesión.",
    loadingPage: "Cargando contexto de la página...",
    pageReady: "Contexto de la página listo.",
    pageUnavailable: "Contexto de la página no disponible.",
    loadingFile: "Cargando archivo, espera...",
    loadingAnswer: "Cargando respuesta...",
    sessionReset: "Sesión limpia. Listo.",
    attachedFile: "Adjunto",
    processingImage: "Procesando OCR de la imagen",
    imageReady: "OCR de la imagen listo",
    memoryResumeFailed: "Error al resumir la memoria.",
    promptFailed: "Error al generar respuesta.",
    modelNotWorking: "Modelo sin respuesta."
  },
  ja: {
    theme: "テーマ",
    light: "ライト",
    dark: "ダーク",
    darkSun: "ダークサン",
    language: "言語",
    memory: "メモリ",
    memoryPlaceholder: DEFAULT_MEMORY,
    resume: "要約",
    save: "保存",
    minimize: "最小化",
    trustPrompt:
      "このページを信頼しますか？ 内容はモデルとの会話コンテキストとしてコピーされます。悪意のあるサイトはこれを操作しようとする可能性があります。",
    trustAccept: "ページを信頼してコンテキストを読み込む",
    trustDeny: "ページのコンテキストを読み込まない",
    trustAcceptCompact: "信頼してHTMLを読む",
    trustDenyCompact: "信頼しない",
    terminalReady: "準備完了。",
    messagePlaceholder: "ページやファイルについて質問してください",
    reset: "リセット",
    copy: "コピー",
    send: "送信",
    copyright: "Copyright © Local SideMind.",
    footerTip:
      "注意: ローカルLLMは誤ることがあります。コードを慎重に確認し、理解していないものや信頼できないものは実行しないでください。",
    modelUnavailable: "未応答",
    modelReady: "準備完了",
    modelNotInstalled: "未インストール",
    environmentStatus: "ローカルブラウザーアシスタント",
    greeting: "こんにちは。今日はどのようにお手伝いできますか？",
    greetingLoaded: "こんにちは。今日はどのようにお手伝いできますか？ 現在のページを読み込みました。",
    greetingDenied: "こんにちは。今日はどのようにお手伝いできますか？ ページ内容にはアクセスしていません。",
    transcriptPrefix: "これは以前の自分との会話です:",
    transcriptCopied: "会話をコピーしました。",
    pageContextDisabled: "このセッションではページコンテキストが無効です。",
    loadingPage: "ページコンテキストを読み込み中...",
    pageReady: "ページコンテキストの準備ができました。",
    pageUnavailable: "ページコンテキストを利用できません。",
    loadingFile: "ファイルを読み込み中です。お待ちください...",
    loadingAnswer: "回答を読み込み中...",
    sessionReset: "セッションをリセットしました。準備完了。",
    attachedFile: "添付済み",
    processingImage: "画像OCRを処理中",
    imageReady: "画像OCRの準備ができました",
    memoryResumeFailed: "メモリ要約に失敗しました。",
    promptFailed: "応答の生成に失敗しました。",
    modelNotWorking: "モデルが応答していません。"
  },
  fr: {
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    darkSun: "Soleil sombre",
    language: "Langue",
    memory: "Mémoire",
    memoryPlaceholder: DEFAULT_MEMORY,
    resume: "Résumer",
    save: "Enregistrer",
    minimize: "Réduire",
    trustPrompt:
      "Faites-vous confiance à cette page ? Le contenu sera copié comme contexte pour votre conversation avec le modèle. Des sites malveillants peuvent tenter de le manipuler.",
    trustAccept: "Faire confiance à la page et charger le contexte",
    trustDeny: "Ne pas charger le contexte de la page",
    trustAcceptCompact: "Faire confiance et lire le HTML",
    trustDenyCompact: "Ne pas faire confiance",
    terminalReady: "Prêt.",
    messagePlaceholder: "Posez une question sur la page ou vos fichiers",
    reset: "Effacer",
    copy: "Copier",
    send: "Envoyer",
    copyright: "Copyright © Local SideMind.",
    footerTip:
      "Conseil : Les LLM locaux peuvent se tromper. Vérifiez le code avec attention et n'exécutez jamais quelque chose que vous ne comprenez pas ou en quoi vous n'avez pas confiance.",
    modelUnavailable: "indisponible",
    modelReady: "prêt",
    modelNotInstalled: "non installé",
    environmentStatus: "Assistant local du navigateur",
    greeting: "Bonjour, comment puis-je vous aider aujourd'hui ?",
    greetingLoaded: "Bonjour, comment puis-je vous aider aujourd'hui ? J'ai lu la page sur laquelle vous êtes.",
    greetingDenied: "Bonjour, comment puis-je vous aider aujourd'hui ? Je n'ai pas accédé au contenu de votre page.",
    transcriptPrefix: "Voici une conversation avec une instance précédente de vous-même :",
    transcriptCopied: "Transcription copiée.",
    pageContextDisabled: "Contexte de page désactivé pour cette session.",
    loadingPage: "Chargement du contexte de la page...",
    pageReady: "Contexte de la page prêt.",
    pageUnavailable: "Contexte de la page indisponible.",
    loadingFile: "Chargement du fichier, veuillez patienter...",
    loadingAnswer: "Chargement de la réponse...",
    sessionReset: "Session réinitialisée. Prêt.",
    attachedFile: "Fichier joint",
    processingImage: "Traitement OCR de l'image",
    imageReady: "OCR de l'image prêt",
    memoryResumeFailed: "Échec du résumé de la mémoire.",
    promptFailed: "Échec de la génération de réponse.",
    modelNotWorking: "Le modèle ne répond pas."
  },
  de: {
    theme: "Design",
    light: "Hell",
    dark: "Dunkel",
    darkSun: "Dunkle Sonne",
    language: "Sprache",
    memory: "Speicher",
    memoryPlaceholder: DEFAULT_MEMORY,
    resume: "Zusammenfassen",
    save: "Speichern",
    minimize: "Minimieren",
    trustPrompt:
      "Vertrauen Sie dieser Seite? Der Inhalt wird als Kontext in Ihre Modellunterhaltung kopiert. Bösartige Websites können versuchen, ihn zu manipulieren.",
    trustAccept: "Seite vertrauen und Kontext laden",
    trustDeny: "Seitenkontext nicht laden",
    trustAcceptCompact: "Vertrauen und HTML lesen",
    trustDenyCompact: "Nicht vertrauen",
    terminalReady: "Bereit.",
    messagePlaceholder: "Fragen Sie etwas zur Seite oder zu Ihren Dateien",
    reset: "Leeren",
    copy: "Kopieren",
    send: "Senden",
    copyright: "Copyright © Local SideMind.",
    footerTip:
      "Hinweis: Lokale LLMs können Fehler machen. Prüfen Sie Code sorgfältig und führen Sie niemals etwas aus, das Sie nicht verstehen oder dem Sie nicht vertrauen.",
    modelUnavailable: "ohne Antwort",
    modelReady: "bereit",
    modelNotInstalled: "nicht installiert",
    environmentStatus: "Lokaler Browser-Assistent",
    greeting: "Hallo, wie kann ich Ihnen heute helfen?",
    greetingLoaded: "Hallo, wie kann ich Ihnen heute helfen? Ich habe die aktuelle Seite gelesen.",
    greetingDenied: "Hallo, wie kann ich Ihnen heute helfen? Ich habe nicht auf den Seiteninhalt zugegriffen.",
    transcriptPrefix: "Dies war ein Gespräch mit einer früheren Instanz von Ihnen selbst:",
    transcriptCopied: "Transkript kopiert.",
    pageContextDisabled: "Seitenkontext für diese Sitzung deaktiviert.",
    loadingPage: "Seitenkontext wird geladen...",
    pageReady: "Seitenkontext bereit.",
    pageUnavailable: "Seitenkontext nicht verfügbar.",
    loadingFile: "Datei wird geladen, bitte warten...",
    loadingAnswer: "Antwort wird geladen...",
    sessionReset: "Sitzung geleert. Bereit.",
    attachedFile: "Angehängt",
    processingImage: "Bild-OCR wird verarbeitet",
    imageReady: "Bild-OCR bereit",
    memoryResumeFailed: "Speicherzusammenfassung fehlgeschlagen.",
    promptFailed: "Antwort konnte nicht erzeugt werden.",
    modelNotWorking: "Modell antwortet nicht."
  }
};

export function getUiStrings(language: LanguageCode): UiStrings {
  return STRINGS[language] ?? STRINGS.en;
}
