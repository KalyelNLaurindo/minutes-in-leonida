import { createContext, useContext, type ReactNode } from "react";

export type Locale = "pt" | "en" | "es";

const dictionaries: Record<Locale, Record<string, string>> = {
  pt: {},
  en: {
    Cancelar: "Cancel",
    Confirmar: "Confirm",
    Início: "Home",
    Jogadores: "Players",
    Histórico: "History",
    Ajustes: "Settings",
    "A turma vai se aventurar pelas ruas da Cidade do Vício, mas só tem um controle? Revezem os turnos e tentem não chamar a polícia no caminho.":
      "Your crew is hitting the streets of Vice City, but there’s only one controller? Take turns and try not to attract the cops.",
    "MONTAR SESSÃO": "START A SESSION",
    "Sortear a ordem": "Draw the order",
    "Jogar o turno": "Play your turn",
    "Passar o controle": "Pass the controller",
    "01 / O TEMPO É REI": "01 / TIME RULES",
    "Adicionar jogador": "Add player",
    "SORTEAR ORDEM": "DRAW THE ORDER",
    COMEÇA: "STARTS",
    "Sortear de novo": "Draw again",
    "INICIAR SESSÃO": "START SESSION",
    turnos: "turns",
    "VOLTAR AO INÍCIO": "BACK TO HOME",
    "FEITO COM CARINHO POR": "MADE WITH CARE BY",
    Nome: "Name",
    "Escolha sua cor": "Choose a color",
    "JOGADORES SALVOS": "SAVED PLAYERS",
    "SESSÃO EM ANDAMENTO": "SESSION IN PROGRESS",
    "PRÓXIMO NA FILA": "UP NEXT",
    RETOMAR: "RESUME",
    MORREU: "DIED",
    PAUSAR: "PAUSE",
    "Encerrar sessão": "End session",
    "ORDEM DA NOITE": "TONIGHT’S ORDER",
    "Agora é a vez de": "It’s now",
    DURAÇÃO: "DURATION",
    TURNOS: "TURNS",
    MORTES: "DEATHS",
    "POR JOGADOR": "PER PLAYER",
    jogados: "played",
    mortes: "deaths",
    tempos: "timeouts",
    Média: "Average",
    "· Maior turno": "· Longest turn",
    "LINHA DO TEMPO": "TIMELINE",
    "Exportar placar (.md)": "Export score (.md)",
    "DURAÇÃO DOS TURNOS": "TURN LENGTH",
    "Preset da próxima sessão": "Next session preset",
    "Esta escolha fica salva; sessões em andamento mantêm o tempo original.":
      "This choice is saved; ongoing sessions keep their original duration.",
    min: "min",
    "Criar preset (1 a 180 minutos)": "Create a preset (1–180 minutes)",
    "Salvar preset": "Save preset",
    ALERTAS: "ALERTS",
    "Alarme sonoro": "Sound alarm",
    "Aviso quando o tempo acabar e o app estiver aberto":
      "Alert when time runs out while the app is open",
    Volume: "Volume",
    "Testar alarme": "Test alarm",
    Vibração: "Vibration",
    "Quando disponível no aparelho": "When supported by the device",
    Notificações: "Notifications",
    Permitir: "Allow",
    APLICATIVO: "APP",
    "Instalar no aparelho": "Install on this device",
    "Baixar cópia de segurança": "Download a backup",
    "Restaurar cópia de segurança": "Restore a backup",
    "Apagar todos os dados": "Delete all data",
    JOGADORES: "PLAYERS",
    "O ELENCO": "THE CREW",
    "Adicione sua galera antes de partir para o sorteio.":
      "Add your crew before drawing the order.",
    "QUEM JOGA?": "WHO’S PLAYING?",
    "A ORDEM ESTÁ DECIDIDA.": "THE ORDER IS SET.",
    "SORTEIO / 02": "DRAW / 02",
    HISTÓRICO: "HISTORY",
    "ARQUIVO DE LEONIDA": "LEONIDA ARCHIVE",
    "Cada turno tem uma história.": "Every turn has a story.",
    "Nada por aqui ainda.": "Nothing here yet.",
    "Sua primeira sessão vai aparecer aqui.": "Your first session will show up here.",
    "FIM DE JOGO": "GAME OVER",
    "RESUMO DA SESSÃO": "SESSION SUMMARY",
    "Mais uma noite em Leonida.": "Another night in Leonida.",
    AJUSTES: "SETTINGS",
    "DO SEU JEITO": "YOUR WAY",
    "Tudo fica guardado somente neste aparelho.": "Everything stays on this device.",
    "Como funciona": "How it works",
    "Como te chamam?": "What should we call you?",
    "O jogador será removido da sua lista. Sessões antigas continuarão intactas.":
      "This player will be removed from your list. Past sessions will remain unchanged.",
    "A equipe ainda está vazia.": "Your crew is still empty.",
    "Adicione pelo menos duas pessoas para começar.": "Add at least two people to get started.",
    "Encerrar sessão?": "End session?",
    "O turno atual será registrado e a sessão ficará salva no histórico.":
      "The current turn will be recorded and the session saved to history.",
    "Nenhuma sessão encontrada.": "No session found.",
    "Volte para o histórico.": "Go back to history.",
    "Apagar todos os dados?": "Delete all data?",
    "Jogadores, sessão atual, histórico e ajustes serão apagados apenas deste aparelho. Isso não pode ser desfeito.":
      "Players, the current session, history, and settings will be deleted from this device. This cannot be undone.",
    "Navegação principal": "Main navigation",
    "FEITO PARA A NOITE DURAR MAIS.": "MADE FOR A LONGER NIGHT.",
    SELECIONADOS: "SELECTED",
    VOLTAR: "BACK",
    "EDITAR JOGADOR": "EDIT PLAYER",
    "NOVO JOGADOR": "NEW PLAYER",
    SALVAR: "SAVE",
    ADICIONAR: "ADD PLAYER",
    PAUSADA: "PAUSED",
    "AO VIVO": "LIVE",
    "SESSÃO PAUSADA": "SESSION PAUSED",
    "AGORA É A VEZ DE": "IT’S YOUR TURN",
    "TEMPO RESTANTE": "TIME LEFT",
    TEMPO: "TIME",
    ENCERRADO: "ENDED",
    Idioma: "Language",
    "Tempo restante": "Time remaining",
    Editar: "Edit",
    Remover: "Remove",
    Cor: "Color",
    "Cor do jogador": "Player color",
    "Permissões permitidas": "Allowed",
    "Bloqueadas pelo navegador": "Blocked by browser",
    "Não disponíveis neste aparelho": "Unavailable on this device",
    "Permissão opcional": "Optional permission",
    "Cópia restaurada e salva neste aparelho.": "Backup restored and saved on this device.",
    "Esta cópia não pode ser restaurada.": "This backup cannot be restored.",
    "Restaurar cópia": "Restore backup",
    "Copiar de segurança": "Back up data",
    "/ 4 SELECIONADOS": "/ 4 SELECTED",
    "NOVA SESSÃO / 01": "NEW SESSION / 01",
    "Cara ou coroa. O destino escolheu quem começa.": "Heads or tails. Fate picked who goes first.",
    "A cidade escolheu quem vai primeiro.": "The city picked who goes first.",
    "Escolha de 2 a 4 pessoas. Cada turno terá minutos; a ordem será sorteada.":
      "Choose 2 to 4 players. Each turn lasts minutes; the order will be drawn.",
    "Nome inválido.": "Invalid name.",
    "Não foi possível exportar o placar da sessão.": "Could not export the session score.",
    "Não foi possível sortear a ordem.": "Could not draw the order.",
    "Não foi possível baixar a cópia de segurança.": "Could not download the backup.",
    "Não foi possível restaurar a cópia.": "Could not restore the backup.",
    "Não foi possível salvar o preset.": "Could not save the preset.",
    "Restaurar esta cópia substituirá os jogadores, sessão, histórico e ajustes atuais. Continuar?":
      "Restoring this backup will replace the current players, session, history, and settings. Continue?",
    Sorteio: "Draw",
    "#": "#",
    "NOVA VEZ": "NEXT TURN",
    "TEMPO!": "TIME!",
    Permitidas: "Allowed",
    "Não foi possível preparar os dados para salvar.": "Could not prepare data to save.",
    "Não foi possível salvar os dados.": "Could not save data.",
    "Não foi possível apagar os dados locais.": "Could not delete local data.",
    "Esse nome já existe.": "That name is already in use.",
    "Jogador não encontrado.": "Player not found.",
    "Use um nome de 1 a 24 caracteres.": "Use a name with 1 to 24 characters.",
    "Escolha uma das cores disponíveis.": "Choose one of the available colors.",
    "Escolha um tempo inteiro entre 1 e 180 minutos.":
      "Choose a whole number between 1 and 180 minutes.",
    "Selecione de 2 a 4 jogadores com nomes diferentes.":
      "Choose 2 to 4 players with different names.",
    "Ordem indisponível.": "Order is unavailable.",
    "A sessão precisa ter jogadores.": "The session needs players.",
    "Turno indisponível.": "Turn is unavailable.",
    "Sessão não está ativa.": "The session is not active.",
    "Sessão não está pausada.": "The session is not paused.",
    "Sessão não iniciada.": "The session has not started.",
    "Mantenha pelo menos um preset de duração.": "Keep at least one duration preset.",
    "Salve esse tempo como preset antes de selecioná-lo.":
      "Save this duration as a preset before selecting it.",
    "O volume deve ficar entre 0 e 100%.": "Volume must be between 0 and 100%.",
    "Uma cópia de segurança recuperou seus dados.": "Your data was recovered from a backup.",
    "Seus dados foram atualizados para o novo formato.":
      "Your data has been updated to the new format.",
    "O navegador bloqueou a leitura dos dados locais.": "The browser blocked access to local data.",
    "Esse arquivo não é uma cópia válida do Minutes in Leonida.":
      "This file is not a valid Minutes in Leonida backup.",
    "Os dados antigos foram carregados, mas não foi possível gravar a nova cópia.":
      "Old data was loaded, but its updated backup could not be saved.",
    "Os dados salvos parecem inválidos. Uma cópia vazia foi aberta; os dados originais foram preservados.":
      "Saved data appears invalid. An empty copy was opened; the original data was preserved.",
    "As cópias salvas não puderam ser validadas. Seus dados originais foram preservados.":
      "Saved copies could not be validated. Your original data was preserved.",
    "Não foi possível salvar. Libere espaço no navegador ou exporte seus dados.":
      "Could not save. Free up browser storage or export your data.",
    "A cópia principal falhou; seus dados foram gravados apenas no backup.":
      "The primary copy failed; your data was saved in the backup only.",
    "O navegador pode mostrar uma notificação quando o app detectar o fim do turno. Ele não garante alertas se o sistema suspender ou fechar o app.":
      "The browser may show a notification when the app detects the end of a turn. Alerts are not guaranteed if the system suspends or closes the app.",
    "No navegador, escolha “Adicionar à tela inicial”. Após abrir conectado uma vez, funciona offline no site publicado.":
      "In your browser, choose “Add to Home Screen”. After opening the published site once while online, it works offline.",
    "Guarde o arquivo fora do navegador para recuperar seus jogadores e histórico se os dados locais forem apagados.":
      "Keep this file outside the browser so you can restore your players and history if local data is erased.",
  },
  es: {
    Cancelar: "Cancelar",
    Confirmar: "Confirmar",
    Início: "Inicio",
    Jogadores: "Jugadores",
    Histórico: "Historial",
    Ajustes: "Ajustes",
    "A turma vai se aventurar pelas ruas da Cidade do Vício, mas só tem um controle? Revezem os turnos e tentem não chamar a polícia no caminho.":
      "La banda recorrerá las calles de la Ciudad del Vicio, pero ¿solo hay un mando? Túrnense y procuren no llamar la atención de la policía.",
    "MONTAR SESSÃO": "ARMAR LA SESIÓN",
    "Sortear a ordem": "Sortear el orden",
    "Jogar o turno": "Jugar el turno",
    "Passar o controle": "Pasar el mando",
    "01 / O TEMPO É REI": "01 / EL TIEMPO MANDA",
    "Adicionar jogador": "Añadir jugador",
    "SORTEAR ORDEM": "SORTEAR EL ORDEN",
    COMEÇA: "EMPIEZA",
    "Sortear de novo": "Sortear de nuevo",
    "INICIAR SESSÃO": "INICIAR SESIÓN",
    turnos: "turnos",
    "VOLTAR AO INÍCIO": "VOLVER AL INICIO",
    "FEITO COM CARINHO POR": "HECHO CON CARIÑO POR",
    Nome: "Nombre",
    "Escolha sua cor": "Elige tu color",
    "JOGADORES SALVOS": "JUGADORES GUARDADOS",
    "SESSÃO EM ANDAMENTO": "SESIÓN EN CURSO",
    "PRÓXIMO NA FILA": "SIGUIENTE",
    RETOMAR: "REANUDAR",
    MORREU: "ELIMINADO",
    PAUSAR: "PAUSAR",
    "Encerrar sessão": "Terminar sesión",
    "ORDEM DA NOITE": "ORDEN DE LA NOCHE",
    "Agora é a vez de": "Ahora le toca a",
    DURAÇÃO: "DURACIÓN",
    TURNOS: "TURNOS",
    MORTES: "MUERTES",
    "POR JOGADOR": "POR JUGADOR",
    jogados: "jugados",
    mortes: "muertes",
    tempos: "tiempos",
    Média: "Promedio",
    "· Maior turno": "· Turno más largo",
    "LINHA DO TEMPO": "LÍNEA DE TIEMPO",
    "Exportar placar (.md)": "Exportar marcador (.md)",
    "DURAÇÃO DOS TURNOS": "DURACIÓN DE LOS TURNOS",
    "Preset da próxima sessão": "Duración para la próxima sesión",
    "Esta escolha fica salva; sessões em andamento mantêm o tempo original.":
      "La elección se guarda; las sesiones en curso mantienen su duración original.",
    min: "min",
    "Criar preset (1 a 180 minutos)": "Crear duración (1–180 minutos)",
    "Salvar preset": "Guardar duración",
    ALERTAS: "ALERTAS",
    "Alarme sonoro": "Alarma sonora",
    "Aviso quando o tempo acabar e o app estiver aberto":
      "Aviso al terminar el tiempo mientras la app esté abierta",
    Volume: "Volumen",
    "Testar alarme": "Probar alarma",
    Vibração: "Vibración",
    "Quando disponível no aparelho": "Cuando el dispositivo lo permita",
    Notificações: "Notificaciones",
    Permitir: "Permitir",
    APLICATIVO: "APLICACIÓN",
    "Instalar no aparelho": "Instalar en el dispositivo",
    "Baixar cópia de segurança": "Descargar una copia de seguridad",
    "Restaurar cópia de segurança": "Restaurar copia de seguridad",
    "Apagar todos os dados": "Borrar todos los datos",
    JOGADORES: "JUGADORES",
    "O ELENCO": "EL EQUIPO",
    "Adicione sua galera antes de partir para o sorteio.":
      "Añade a tu grupo antes de sortear el orden.",
    "QUEM JOGA?": "¿QUIÉN JUEGA?",
    "A ORDEM ESTÁ DECIDIDA.": "EL ORDEN ESTÁ DECIDIDO.",
    "SORTEIO / 02": "SORTEO / 02",
    HISTÓRICO: "HISTORIAL",
    "ARQUIVO DE LEONIDA": "ARCHIVO DE LEONIDA",
    "Cada turno tem uma história.": "Cada turno tiene su historia.",
    "Nada por aqui ainda.": "Todavía no hay nada.",
    "Sua primeira sessão vai aparecer aqui.": "Tu primera sesión aparecerá aquí.",
    "FIM DE JOGO": "FIN DEL JUEGO",
    "RESUMO DA SESSÃO": "RESUMEN DE LA SESIÓN",
    "Mais uma noite em Leonida.": "Otra noche en Leonida.",
    AJUSTES: "AJUSTES",
    "DO SEU JEITO": "A TU MANERA",
    "Tudo fica guardado somente neste aparelho.": "Todo se guarda únicamente en este dispositivo.",
    "Como funciona": "Cómo funciona",
    "Como te chamam?": "¿Cómo te llamas?",
    "O jogador será removido da sua lista. Sessões antigas continuarão intactas.":
      "Se eliminará a esta persona de la lista. Las sesiones anteriores no cambiarán.",
    "A equipe ainda está vazia.": "El equipo todavía está vacío.",
    "Adicione pelo menos duas pessoas para começar.": "Añade al menos a dos personas para empezar.",
    "Encerrar sessão?": "¿Terminar la sesión?",
    "O turno atual será registrado e a sessão ficará salva no histórico.":
      "El turno actual quedará registrado y la sesión se guardará en el historial.",
    "Nenhuma sessão encontrada.": "No se encontró ninguna sesión.",
    "Volte para o histórico.": "Vuelve al historial.",
    "Apagar todos os dados?": "¿Borrar todos los datos?",
    "Jogadores, sessão atual, histórico e ajustes serão apagados apenas deste aparelho. Isso não pode ser desfeito.":
      "Los jugadores, la sesión actual, el historial y los ajustes se borrarán de este dispositivo. No se puede deshacer.",
    "Navegação principal": "Navegación principal",
    "FEITO PARA A NOITE DURAR MAIS.": "HECHO PARA QUE LA NOCHE DURE MÁS.",
    SELECIONADOS: "SELECCIONADOS",
    VOLTAR: "VOLVER",
    "EDITAR JOGADOR": "EDITAR JUGADOR",
    "NOVO JOGADOR": "NUEVO JUGADOR",
    SALVAR: "GUARDAR",
    ADICIONAR: "AÑADIR",
    PAUSADA: "EN PAUSA",
    "AO VIVO": "EN VIVO",
    "SESSÃO PAUSADA": "SESIÓN EN PAUSA",
    "AGORA É A VEZ DE": "AHORA LE TOCA A",
    "TEMPO RESTANTE": "TIEMPO RESTANTE",
    TEMPO: "TIEMPO",
    ENCERRADO: "FINALIZADO",
    Idioma: "Idioma",
    "Tempo restante": "Tiempo restante",
    Editar: "Editar",
    Remover: "Eliminar",
    Cor: "Color",
    "Cor do jogador": "Color del jugador",
    "Permissões permitidas": "Permitidas",
    "Bloqueadas pelo navegador": "Bloqueadas por el navegador",
    "Não disponíveis neste aparelho": "No disponibles en este dispositivo",
    "Permissão opcional": "Permiso opcional",
    "Cópia restaurada e salva neste aparelho.": "Copia restaurada y guardada en este dispositivo.",
    "Restaurar cópia": "Restaurar copia",
    "Copiar de segurança": "Crear copia de seguridad",
    "/ 4 SELECIONADOS": "/ 4 SELECCIONADOS",
    "NOVA SESSÃO / 01": "NUEVA SESIÓN / 01",
    "Cara ou coroa. O destino escolheu quem começa.":
      "Cara o cruz. El destino eligió quién empieza.",
    "A cidade escolheu quem vai primeiro.": "La ciudad eligió quién va primero.",
    "Escolha de 2 a 4 pessoas. Cada turno terá minutos; a ordem será sorteada.":
      "Elige de 2 a 4 personas. Cada turno dura minutos; se sorteará el orden.",
    "Nome inválido.": "Nombre no válido.",
    "Não foi possível exportar o placar da sessão.":
      "No se pudo exportar el marcador de la sesión.",
    "Não foi possível sortear a ordem.": "No se pudo sortear el orden.",
    "Não foi possível baixar a cópia de segurança.": "No se pudo descargar la copia de seguridad.",
    "Não foi possível restaurar a cópia.": "No se pudo restaurar la copia.",
    "Não foi possível salvar o preset.": "No se pudo guardar la duración.",
    "Restaurar esta cópia substituirá os jogadores, sessão, histórico e ajustes atuais. Continuar?":
      "Al restaurar esta copia se reemplazarán los jugadores, la sesión, el historial y los ajustes actuales. ¿Continuar?",
    Sorteio: "Sorteo",
    "#": "#",
    "NOVA VEZ": "SIGUIENTE TURNO",
    "TEMPO!": "¡TIEMPO!",
    Permitidas: "Permitidas",
    "Não foi possível preparar os dados para salvar.":
      "No se pudieron preparar los datos para guardar.",
    "Não foi possível salvar os dados.": "No se pudieron guardar los datos.",
    "Não foi possível apagar os dados locais.": "No se pudieron borrar los datos locales.",
    "Esse nome já existe.": "Ese nombre ya está en uso.",
    "Jogador não encontrado.": "Jugador no encontrado.",
    "Use um nome de 1 a 24 caracteres.": "Usa un nombre de 1 a 24 caracteres.",
    "Escolha uma das cores disponíveis.": "Elige uno de los colores disponibles.",
    "Escolha um tempo inteiro entre 1 e 180 minutos.":
      "Elige un número entero entre 1 y 180 minutos.",
    "Selecione de 2 a 4 jogadores com nomes diferentes.":
      "Elige de 2 a 4 jugadores con nombres distintos.",
    "Ordem indisponível.": "El orden no está disponible.",
    "A sessão precisa ter jogadores.": "La sesión necesita jugadores.",
    "Turno indisponível.": "El turno no está disponible.",
    "Sessão não está ativa.": "La sesión no está activa.",
    "Sessão não está pausada.": "La sesión no está en pausa.",
    "Sessão não iniciada.": "La sesión no ha empezado.",
    "Mantenha pelo menos um preset de duração.": "Conserva al menos una duración guardada.",
    "Salve esse tempo como preset antes de selecioná-lo.":
      "Guarda esta duración antes de seleccionarla.",
    "O volume deve ficar entre 0 e 100%.": "El volumen debe estar entre 0 y 100%.",
    "Uma cópia de segurança recuperou seus dados.":
      "Se recuperaron tus datos desde una copia de seguridad.",
    "Seus dados foram atualizados para o novo formato.":
      "Tus datos se actualizaron al nuevo formato.",
    "O navegador bloqueou a leitura dos dados locais.":
      "El navegador bloqueó el acceso a los datos locales.",
    "Não foi possível apagar todas as cópias locais.":
      "No se pudieron borrar todas las copias locales.",
    "Esse arquivo não é uma cópia válida do Minutes in Leonida.":
      "Este archivo no es una copia válida de Minutes in Leonida.",
    "Os dados antigos foram carregados, mas não foi possível gravar a nova cópia.":
      "Se cargaron los datos anteriores, pero no se pudo guardar la copia actualizada.",
    "Os dados salvos parecem inválidos. Uma cópia vazia foi aberta; os dados originais foram preservados.":
      "Los datos guardados parecen inválidos. Se abrió una copia vacía y se conservaron los datos originales.",
    "As cópias salvas não puderam ser validadas. Seus dados originais foram preservados.":
      "No se pudieron validar las copias guardadas. Se conservaron los datos originales.",
    "Não foi possível salvar. Libere espaço no navegador ou exporte seus dados.":
      "No se pudo guardar. Libera espacio del navegador o exporta tus datos.",
    "A cópia principal falhou; seus dados foram gravados apenas no backup.":
      "Falló la copia principal; tus datos se guardaron solo en la copia de seguridad.",
    "O navegador pode mostrar uma notificação quando o app detectar o fim do turno. Ele não garante alertas se o sistema suspender ou fechar o app.":
      "El navegador puede mostrar un aviso cuando la app detecte el final del turno. No se garantizan avisos si el sistema suspende o cierra la app.",
    "No navegador, escolha “Adicionar à tela inicial”. Após abrir conectado uma vez, funciona offline no site publicado.":
      "En el navegador, elige “Añadir a la pantalla de inicio”. Después de abrir el sitio publicado una vez con conexión, funcionará sin conexión.",
    "Guarde o arquivo fora do navegador para recuperar seus jogadores e histórico se os dados locais forem apagados.":
      "Guarda este archivo fuera del navegador para recuperar a tus jugadores y el historial si se borran los datos locales.",
  },
};

export const LocaleContext = createContext<Locale>("pt");

export function translate(locale: Locale, text: string): string {
  const key = text.trim().replace(/\s+/g, " ");
  const durationChoice = key.match(
    /^Escolha de 2 a 4 pessoas\. Cada turno terá (\d+) minutos; a ordem será sorteada\.$/,
  );
  const removePlayer = key.match(/^Remover (.+)\?$/);
  const removePreset = key.match(/^Remover preset de (\d+) minutos$/);
  const dynamic = durationChoice
    ? locale === "en"
      ? `Choose 2 to 4 players. Each turn lasts ${durationChoice[1]} minutes; the order will be drawn.`
      : locale === "es"
        ? `Elige de 2 a 4 personas. Cada turno dura ${durationChoice[1]} minutos; se sorteará el orden.`
        : undefined
    : removePlayer
      ? locale === "en"
        ? `Remove ${removePlayer[1]}?`
        : locale === "es"
          ? `¿Eliminar a ${removePlayer[1]}?`
          : undefined
      : removePreset
        ? locale === "en"
          ? `Remove the ${removePreset[1]} minute preset`
          : locale === "es"
            ? `Eliminar la duración de ${removePreset[1]} minutos`
            : undefined
        : undefined;
  const translated = dynamic ?? dictionaries[locale][key];
  if (!translated) return text;
  return `${/^\s/.test(text) ? " " : ""}${translated}${/\s$/.test(text) ? " " : ""}`;
}

/** Localize static copy while preserving spacing around adjacent JSX elements. */
export function L({ children }: { children: ReactNode }) {
  const locale = useContext(LocaleContext);
  if (typeof children !== "string") return children;
  return translate(locale, children);
}
