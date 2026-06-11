/** Shared Tailwind class strings (legacy sp-* search/counter patterns). */

export const spFilterSection =
  "relative z-20 mx-auto max-w-[1200px] px-4 pt-[0.65rem]";

export const spFilterCard =
  "rounded-[var(--radius-md)] border border-[var(--border)] bg-white shadow-[var(--shadow-xs)]";

export const spFilterRow =
  "flex flex-wrap items-stretch gap-2 p-3 max-[560px]:gap-2";

export const spFilterSelect =
  "box-border h-[42px] min-w-[7.25rem] max-w-full flex-[1_1_7.25rem] appearance-none rounded-[3px] border border-[var(--border)] bg-white bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%2710%27%3E%3Cpath%20fill%3D%27%23666%27%20d%3D%27M2%203l3%203%203-3%27%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_0.45rem_center] bg-no-repeat py-0 pr-7 pl-[0.55rem] text-[0.875rem] font-bold uppercase font-inherit lg:min-w-[9rem] lg:flex-[1_1_9rem] max-[560px]:min-w-[calc(50%-0.25rem)] max-[560px]:flex-[1_1_calc(50%-0.25rem)]";

export const spFilterDateField =
  "box-border flex h-[42px] min-w-[8.75rem] max-w-full flex-[1_1_8.75rem] items-center rounded-[3px] border border-[var(--border)] bg-white max-[560px]:min-w-[calc(50%-0.25rem)] max-[560px]:flex-[1_1_calc(50%-0.25rem)]";

export const spFilterAcGroup = "inline-flex gap-1 self-stretch";

export const spFilterAc =
  "inline-flex min-h-[42px] cursor-pointer items-center gap-[0.3rem] rounded-[3px] border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--text)] font-inherit hover:border-[var(--primary)]";

export const spFilterAcOn =
  "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]";

export const spFilterSearch =
  "inline-flex h-[42px] cursor-pointer items-center justify-center gap-[0.35rem] rounded-[3px] border-none bg-[var(--primary-hover)] px-[1.1rem] text-sm font-bold text-white font-inherit hover:bg-[#145214] disabled:cursor-not-allowed disabled:opacity-60 max-[560px]:min-w-0 max-[560px]:flex-1";

export const spFilterError = "m-0 px-3 pb-2 text-[0.75rem] text-[var(--danger)]";

export const spPanelError = "mb-2 text-[0.75rem] text-[var(--danger)]";

export const spBtnBack =
  "min-h-10 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 font-inherit hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60";

export const spBtnSelect =
  "inline-flex min-h-10 min-w-[120px] cursor-pointer items-center justify-center gap-[0.35rem] rounded-[var(--radius-sm)] border-none bg-[var(--primary)] px-4 py-[0.45rem] text-sm font-semibold text-on-primary font-inherit hover:bg-[var(--primary-hover)]";

export const spBtnSelectCancel =
  "border border-[var(--border)] bg-gray-100 text-gray-700 hover:bg-gray-200";

export const spBtnContinue =
  "mt-auto w-full cursor-pointer rounded-[3px] border-none bg-[var(--primary-hover)] py-[0.6rem] text-[0.9rem] font-bold text-white font-inherit hover:bg-[#145214] disabled:cursor-not-allowed disabled:opacity-65";

export const spCheckoutWrap = "mx-auto max-w-[1200px] px-4 pb-8 max-[767px]:px-3";

export const spCheckoutTitle =
  "m-0 mb-2 mt-3 border border-[var(--border)] bg-[#e8e8e8] px-3 py-[0.45rem] text-[0.95rem] font-bold tracking-[0.04em] text-[#222]";

export const spCheckoutGrid =
  "grid grid-cols-1 border border-[var(--border)] bg-white max-[900px]:grid-cols-1 min-[901px]:grid-cols-3";

export const spCheckoutCol =
  "flex min-w-0 flex-col border-b border-[var(--border)] min-[901px]:border-b-0 min-[901px]:border-r last:min-[901px]:border-r-0";

export const spCheckoutColHeading =
  "m-0 bg-[var(--primary-hover)] px-[0.65rem] py-[0.4rem] text-[0.88rem] font-bold tracking-[0.03em] text-white";

export const spCheckoutOperator =
  "mx-3 mb-2 mt-[0.65rem] min-h-[1.62rem] text-[1.35rem] font-extrabold leading-tight tracking-[0.02em] text-[#111]";

export const spCheckoutOperatorSpacer =
  "mx-3 mb-2 mt-[0.65rem] hidden min-h-[1.62rem] text-[1.35rem] font-extrabold leading-tight tracking-[0.02em] min-[901px]:block min-[901px]:invisible";

export const spCheckoutTable =
  "mx-3 mb-3 w-[calc(100%-1.5rem)] border-collapse text-[0.78rem] [&_td]:border [&_td]:border-[#e0e0e0] [&_td]:px-2 [&_td]:py-[0.35rem] [&_td]:align-top [&_th]:w-[42%] [&_th]:border [&_th]:border-[#e0e0e0] [&_th]:bg-[#fafafa] [&_th]:px-2 [&_th]:py-[0.35rem] [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#444]";

export const spCheckoutTotalRow = "[&_td]:bg-[#f5f5f5] [&_th]:bg-[#f5f5f5]";

export const spCheckoutField =
  "px-3 pt-2 [&_input]:mb-2 [&_input]:h-[34px] [&_input]:w-full [&_input]:rounded-[2px] [&_input]:border [&_input]:border-[var(--border)] [&_input]:px-2 [&_input]:text-[0.82rem] [&_input]:font-inherit [&_label]:mb-1 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#444] [&_select]:mb-2 [&_select]:h-[34px] [&_select]:w-full [&_select]:rounded-[2px] [&_select]:border [&_select]:border-[var(--border)] [&_select]:px-2 [&_select]:text-[0.82rem] [&_select]:font-inherit";

export const spCheckoutActions =
  "mt-5 flex flex-wrap justify-center gap-4";

export const spCheckoutError =
  "mx-auto mt-3 max-w-[1200px] px-4 text-[0.75rem] text-[var(--danger)] max-[767px]:px-3";

export const spReq = "text-[var(--danger)]";

export const spResultsList =
  "mx-auto max-w-[1200px] space-y-3 px-4 pb-8 max-[767px]:px-3";

export const spEmpty =
  "rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-10 text-center text-[#666]";

export const spCard =
  "rounded-[var(--radius-md)] border border-[var(--border)] bg-white shadow-[var(--shadow-xs)] transition-[box-shadow,border-color] duration-150 hover:border-[var(--color-border-strong,#d1d5db)] hover:shadow-[var(--shadow-md)]";

export const spCardExpanded = "border-[#b8d4ba]";

export const spCardRow =
  "grid grid-cols-4 gap-4 p-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 [&_label]:text-[0.72rem] [&_label]:font-semibold [&_label]:text-[#666] [&_strong]:text-[0.85rem]";

export const spCardCol = "flex flex-col gap-1";

export const spCardColPrice = "text-right";

export const spTime = "text-lg font-bold text-[var(--text)]";

export const spCardClass = "text-sm font-semibold text-[var(--primary)]";

export const spCardFare = "text-xl font-bold text-[var(--primary)]";

export const spCardAvail = "text-xs text-[var(--muted)]";

export const spCardRoute =
  "border-t border-[var(--green-100)] bg-[var(--green-50)] px-[1.1rem] py-2 text-sm text-[var(--green-900)]";

export const spSeatExpandWrap =
  "grid grid-rows-[0fr] transition-[grid-template-rows] duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

export const spSeatExpandWrapOpen = "grid-rows-[1fr]";

export const spSeatExpandInner =
  "min-h-0 overflow-hidden opacity-0 transition-opacity duration-350 motion-reduce:transition-none";

export const spSeatExpandInnerOpen = "opacity-100";

export const spSeatLoading =
  "border-t-2 border-[var(--primary)] bg-[#f5f5f5] p-8 text-center text-[#666]";

export const spSeatPanelV2 =
  "grid border-x border-b border-[var(--border)] border-t-2 border-t-[var(--primary)] bg-[#f8f8f8] max-[900px]:grid-cols-1 grid-cols-[1fr_minmax(260px,300px)]";

export const spSeatPanelMap =
  "overflow-x-auto border-r border-[var(--border)] bg-white p-4 max-[900px]:border-b max-[900px]:border-r-0";

export const spSeatPanelSide =
  "flex flex-col gap-[0.65rem] bg-[#fafafa] p-[0.85rem]";

export const spSeatLegend =
  "mb-0 flex flex-wrap gap-x-3 gap-y-2 text-[0.68rem]";

export const spLegendItem = "flex items-center gap-[0.35rem]";

export const spLegendSwatchAvailable =
  "h-4 w-4 rounded-[2px] border border-[#bbb] bg-white";

export const spLegendSwatchSelected =
  "h-4 w-4 rounded-[2px] border border-[var(--primary)] bg-[var(--primary)]";

export const spLegendSwatchSold =
  "h-4 w-4 rounded-[2px] border border-gray-300 bg-gray-100";

export const spBoardingField =
  "[&_label]:mb-1 [&_label]:block [&_label]:text-xs [&_label]:font-semibold [&_label]:text-[#444] [&_select]:h-[34px] [&_select]:w-full [&_select]:border [&_select]:border-[var(--border)] [&_select]:px-2 [&_select]:text-[0.8rem]";

export const spSeatTableWrap = "border border-[var(--border)] bg-white";

export const spSeatTable =
  "w-full border-collapse text-[0.78rem] [&_td]:border-b [&_td]:border-[#eee] [&_td]:px-2 [&_td]:py-[0.35rem] [&_th]:border-b [&_th]:border-[#ddd] [&_th]:bg-[#f0f0f0] [&_th]:px-2 [&_th]:py-[0.35rem] [&_th]:text-left [&_th]:font-semibold";

export const spSeatTableEmpty =
  "px-2 py-[0.35rem] text-center text-[#999]";

export const spSeatRemove =
  "h-[22px] w-[22px] cursor-pointer rounded-[3px] border-none bg-gray-100 p-0 text-base leading-none text-[#666] font-inherit hover:bg-gray-200";

export const spSeatTableTotal =
  "bg-[var(--primary-hover)] font-bold text-white [&_td]:border-b-0";

export const spSeatTripMeta =
  "text-[0.75rem] leading-[1.55] text-[#444] [&_span]:font-semibold";
