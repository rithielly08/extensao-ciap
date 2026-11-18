import { useReducer } from "react";

/** Mensagens de status exibidas no painel. */
export const NOTICES = {
  start: "Clique em “Selecionar Subjetivo” e depois no local onde escreve no PEC.",
  selecting: "Agora clique dentro da caixa de texto do Subjetivo no PEC.",
  missed:
    "Não detectei caixa de texto nesse ponto. Clique na região exata em que aparece o cursor de digitação.",
  cancelled: "Seleção cancelada.",
  linked: "Campo vinculado. Digite “dor de cabeça” (somente no ambiente de teste).",
  test: "Teste isolado: a frase “dor de cabeça” não foi inserida no prontuário.",
  navigated: "Navegação detectada. Selecione o Subjetivo novamente.",
  recreated: "O PEC recriou o campo. Clique em “Selecionar Subjetivo” novamente.",
  reselect: "Selecione o Subjetivo novamente.",
  disabled: "Extensão desabilitada. Nenhum campo é lido.",
} as const;

export type NoticeKey = keyof typeof NOTICES;

export interface PanelState {
  /** O que o painel está lendo: nada, o campo vinculado ou a frase de teste. */
  mode: "idle" | "linked" | "test";
  field: HTMLElement | null;
  /** Aguardando o usuário clicar no campo do Subjetivo. */
  selecting: boolean;
  notice: NoticeKey;
}

type Action =
  | { type: "startSelecting" }
  | { type: "cancelSelecting" }
  | { type: "missed" }
  | { type: "picked"; field: HTMLElement }
  | { type: "testing" }
  | { type: "reset"; notice: NoticeKey };

const initialState: PanelState = { mode: "idle", field: null, selecting: false, notice: "start" };

function reducer(state: PanelState, action: Action): PanelState {
  switch (action.type) {
    case "startSelecting":
      return { ...state, selecting: true, notice: "selecting" };
    case "cancelSelecting":
      return { ...state, selecting: false, notice: "cancelled" };
    case "missed":
      return { ...state, notice: "missed" };
    case "picked":
      return { mode: "linked", field: action.field, selecting: false, notice: "linked" };
    case "testing":
      return { mode: "test", field: null, selecting: false, notice: "test" };
    case "reset":
      return { ...initialState, notice: action.notice };
  }
}

/** Máquina de estados do painel: ocioso → selecionando → vinculado (ou teste). */
export function usePanelState() {
  return useReducer(reducer, initialState);
}
