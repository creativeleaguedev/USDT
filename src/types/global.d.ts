declare global {
  interface Window {
    Widget: {
      init: (config: {
        widgetId: string;
        type: string;
        language: string;
        showBrand: boolean;
        isShowTradeButton: boolean;
        isShowBeneathLink: boolean;
        isShowDataFromACYInfo: boolean;
        symbolPairs: Array<{
          symbolId: string;
          symbolName: string;
        }>;
        isAdaptive: boolean;
      }) => void;
    };
  }
}

export {};