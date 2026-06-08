/** Tailwind class strings replacing legacy adm-, form-, cms-, and ops-shell admin CSS. */

export const opsPage = "min-h-screen bg-[var(--bg)]";

export const opsHeader =
  "sticky top-0 z-50 border-b border-[var(--border)] bg-white";

export const opsHeaderTop =
  "mx-auto flex max-w-[1200px] items-center justify-between px-3 py-1.5 md:px-4 lg:max-w-[1200px]";

export const opsHeaderTopRight =
  "flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm text-[#333] max-md:text-[0.8rem] max-md:gap-x-3";

export const opsHeaderLink =
  "cursor-pointer border-0 bg-transparent p-0 font-inherit text-[var(--primary)] no-underline hover:text-[var(--primary-hover)]";

export const opsHeaderMain =
  "mx-auto flex min-h-16 max-w-[var(--container-public)] items-center justify-between gap-4 px-3 py-2 max-md:flex-nowrap lg:max-w-[1200px] md:px-4";

export const opsHeaderLogo = "max-md:min-w-0 max-md:flex-1";

export const admNav =
  "flex flex-wrap gap-2 max-[900px]:hidden";

export const admNavBtn =
  "cursor-pointer border border-[#ccc] bg-white px-3 py-2 text-[0.875rem] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]";

export const admNavBtnActive =
  "border-[var(--primary)] bg-[var(--primary)] text-white hover:border-[var(--primary)] hover:bg-[var(--primary)]";

export const admHero =
  "h-[120px] bg-cover bg-[center_top] bg-repeat-x max-[768px]:h-20";

export const admPageTitle =
  "mb-4 text-[0.95rem] font-semibold tracking-[0.04em] text-[#333] uppercase";

export const admSubheading = "mb-3 mt-6 text-base font-semibold";

export const admMuted = "text-[0.875rem] text-[#666]";

export const admCmsHint = "mb-3";

export const admFormCard =
  "mb-4 rounded-lg border border-[#e5e5e5] bg-white p-4 [&_h3]:mb-3 [&_h3]:text-base";

export const admFormRow =
  "mb-3 flex flex-wrap items-end gap-3";

export const admFormField =
  "flex min-w-[140px] flex-col gap-1";

export const admFormFieldWide =
  "max-w-[320px] flex-[1_1_200px]";

export const admFormFieldDatetime =
  "min-w-[200px] max-w-[280px]";

export const admFormFieldLabel =
  "text-[0.8rem] font-semibold text-[#444]";

export const admFormFieldInput =
  "rounded border border-[#ccc] px-2.5 py-2 text-[0.9rem]";

export const admFormActions =
  "mt-3 flex gap-2";

export const admFormActionsWithLabel =
  "mt-3 flex w-full flex-wrap items-end justify-end gap-2";

export const admFormActionsSpacer =
  "invisible max-w-[220px] flex-[1_1_140px] text-[0.8rem] font-semibold text-[#444] max-[768px]:hidden";

export const admFormActionsLabel =
  "invisible max-w-[220px] flex-[1_1_140px] max-[768px]:hidden";

export const admFormActionsButtons =
  "ml-auto flex flex-wrap gap-2";

export const admRowActions = "flex gap-2";

export const admBtnEdit =
  "cursor-pointer rounded border border-[var(--primary)] bg-[var(--primary-light)] px-2.5 py-1 text-[0.8rem] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white";

export const admBtnDelete =
  "cursor-pointer rounded border border-[#c62828] bg-white px-2.5 py-1 text-[0.8rem] text-[#c62828] hover:bg-[#ffebee]";

export const admKpiGrid =
  "mb-4 grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1";

export const admKpiCard =
  "rounded-lg border border-[#e8e8e8] bg-[#fafafa] p-4";

export const admKpiCardLabel =
  "text-[0.75rem] font-semibold tracking-[0.03em] text-[#666] uppercase";

export const admKpiCardStrong =
  "block text-[1.35rem] text-[var(--primary)]";

export const admKpiCardSpan = "text-[0.8rem] text-[#888]";

export const admDashboardCards =
  "grid grid-cols-2 gap-4 max-[768px]:grid-cols-1";

export const admStatCard =
  "overflow-hidden rounded-lg border border-[#e5e5e5] bg-white";

export const admStatCardHead =
  "border-b border-[#eee] bg-[#f5f5f5] px-4 py-3 text-[0.9rem] font-semibold";

export const admLayoutIntro =
  "mb-4 leading-relaxed text-[#555]";

export const admLayoutToolbar =
  "mb-3 flex flex-wrap items-center gap-2";

export const admLayoutToolbarMeta = "flex-1 text-[0.875rem] text-[#666]";

export const admLayoutSubmit = "mt-4";

export const admLayoutEditor = "my-4";

export const admLayoutLegend =
  "mb-3 flex flex-wrap items-center gap-4 text-[0.8rem] text-[#555]";

export const admLayoutHint = "text-[0.75rem] text-[#888]";

export const admLayoutCabin =
  "inline-block rounded-lg border border-[#ddd] bg-[#f9f9f9] p-4";

export const admLayoutCabinLabels =
  "mb-2 flex justify-between text-[0.7rem] font-semibold tracking-wide text-[#888] uppercase";

export const admLayoutRow = "mb-1 flex items-center gap-2";

export const admLayoutRowNum =
  "w-5 text-right text-[0.7rem] text-[#999]";

export const admLayoutRowCells = "flex items-center gap-1";

export const admLayoutCellWrap = "inline-flex items-center";

export const admLayoutCellBase =
  "inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded border border-[#ccc] text-[0.65rem] font-semibold";

export const admLayoutCellEmpty = "bg-[#f0f0f0] text-[#999]";

export const admLayoutCellStandard =
  "border-[#a5d6a7] bg-[#e8f5e9] text-[#2e7d32]";

export const admLayoutCellPremium =
  "border-[#ffcc80] bg-[#fff3e0] text-[#e65100]";

export const admLayoutCellBusiness =
  "border-[#90caf9] bg-[#e3f2fd] text-[#1565c0]";

export const admLayoutCellDemo =
  "h-5 min-w-5 cursor-default";

export const admLayoutAisle = "mx-1 inline-block w-3";

export const admBoardingSection = "mt-6";

export const admBoardingHint = "mb-3 text-[0.875rem] text-[#666]";

export const admBoardingRouteLabel = "mb-3 text-[0.875rem]";

export const admRowSelected = "bg-[var(--primary-light)]";

export const admInlineInput =
  "w-full max-w-[12rem] rounded border border-[#ccc] px-2 py-1 text-[0.875rem]";

export const admCsvImport = "";

export const admCsvImportActions =
  "mb-3 flex flex-wrap items-center gap-3";

export const admCsvImportFile = "max-w-[280px] text-[0.875rem]";

export const admCsvImportErrors =
  "mb-3 list-disc pl-5 text-[0.875rem] text-[#c62828]";

export const admCsvImportPreview = "mt-3";

export const admCsvImportHint = "mt-2 text-[0.8rem] text-[#666]";

export const admReportDateField = "min-w-[10rem]";

export const admSection = "mx-auto max-w-[960px] px-4 py-6";

export const admHelp = "mb-4 text-[0.9rem] text-[#555]";

export const admForm = "flex flex-col gap-3";

export const admFormCardAlt =
  "rounded-lg border border-[#e5e5e5] bg-white p-4";

export const admFormInline =
  "flex flex-row flex-wrap items-end gap-3";

export const admBtn =
  "cursor-pointer rounded border border-[#ccc] bg-white px-3 py-2 text-[0.875rem] hover:bg-[#f5f5f5]";

export const admBtnSm = "px-2 py-1 text-[0.8rem]";

export const admBtnPrimary =
  "border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]";

export const admBtnDanger =
  "border-[#c62828] text-[#c62828] hover:bg-[#ffebee]";

export const admCheckbox = "flex items-center gap-2";

export const admCmsSubnav =
  "mb-4 flex flex-wrap gap-2 border-b border-[#e5e5e5] pb-3";

export const admCmsSubnavBtn =
  "cursor-pointer border border-[#ddd] bg-white px-3 py-1.5 text-[0.8rem] hover:border-[var(--primary)]";

export const admCmsSubnavBtnActive =
  "border-[var(--primary)] bg-[var(--primary-light)] font-semibold text-[var(--primary)]";

export const admCmsSlugTabs =
  "mb-4 flex flex-wrap gap-2";

export const admCmsSlugTabBtn =
  "cursor-pointer rounded-full border border-[#ddd] bg-white px-3 py-1 text-[0.8rem] hover:border-[var(--primary)]";

export const admCmsSlugTabBtnActive =
  "border-[var(--primary)] bg-[var(--primary)] text-white";

export const admCmsEditorSplit =
  "mb-4 grid grid-cols-2 gap-4 max-[768px]:grid-cols-1";

export const admCmsEditorPane = "flex flex-col gap-1";

export const admCmsEditorPaneLabel =
  "text-[0.8rem] font-semibold text-[#444]";

export const admCmsTextarea =
  "min-h-[280px] resize-y rounded border border-[#ccc] px-2.5 py-2 font-mono text-[0.85rem] leading-relaxed";

export const cmsMarkdownBody =
  "[&_p]:mb-4 [&_p:last-child]:mb-0 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-semibold [&_h2]:text-[#111] [&_h2:first-child]:mt-0 [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-semibold [&_h3]:text-[#111] [&_h3:first-child]:mt-0 [&_ul]:mb-4 [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:pl-6 [&_li]:mb-1.5 [&_a]:text-[var(--primary)] [&_strong]:font-semibold";

export const admCmsMarkdownPreview =
  "min-h-[200px] overflow-auto rounded border border-[#e5e5e5] bg-[#fafafa] p-3";

export const admCmsColorRow = "flex items-center gap-2";

export const admCmsHexInput =
  "max-w-[8rem] font-mono uppercase";

export const admCmsPaletteGrid =
  "mb-4 grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2";

export const admCmsSwatch = "text-center";

export const admCmsSwatchChip =
  "mx-auto mb-1 block h-8 w-full rounded border border-[#ddd]";

export const admCmsSwatchLabel =
  "text-[0.65rem] text-[#666] capitalize";

export const admCmsThemePreview =
  "mb-4 overflow-hidden rounded-lg border border-[#e5e5e5]";

export const admCmsThemePreviewBar =
  "px-4 py-3 text-[0.9rem] font-semibold";

export const admCmsThemePreviewBody =
  "flex flex-col gap-3 bg-[var(--card)] p-4";

export const admCmsThemePreviewBtn =
  "cursor-default self-start rounded px-4 py-2 text-[0.875rem] font-semibold";

export const admCmsUploadField = "mb-4";

export const admCmsUploadFieldLabel =
  "mb-1 block text-[0.8rem] font-semibold text-[#444]";

export const admCmsMediaThumb =
  "flex h-24 w-36 items-center justify-center overflow-hidden rounded border border-[#ddd] bg-[#f5f5f5] [&_img]:h-full [&_img]:w-full [&_img]:object-cover";

export const admCmsMediaThumbWide =
  "h-16 w-full max-w-[480px]";

export const admCmsUploadFieldEmpty = "text-[0.8rem]";

export const admCmsUploadFieldPending = "mt-1 text-[0.75rem]";

export const admCmsFileInput = "mt-2 block text-[0.875rem]";

export const admCmsGalleryList =
  "mb-4 list-none space-y-3 p-0";

export const admCmsGalleryItem =
  "flex flex-wrap items-center gap-3";

export const admCmsGalleryItemActions = "flex gap-2";

export const admCmsInlineBtn = "mt-2";

export const admCmsRepeatRow = "items-end";

export const admCmsRowActions = "flex gap-2";

export const admCmsPreviewPanel = "";

export const admCmsPreviewActions =
  "mb-4 flex flex-wrap gap-2";

export const admCmsPreviewLink = "inline-flex no-underline";

export const admCmsPublishBtn = "ml-auto max-[768px]:ml-0";

export const admCmsPreviewSection = "mb-6";

export const admCmsPreviewSectionTitle =
  "mb-2 text-[0.85rem] font-semibold tracking-wide text-[#444] uppercase";

export const admCmsIframeWrap = "mt-6";

export const admCmsSiteIframe =
  "h-[480px] w-full rounded-lg border border-[#ddd] bg-white";

export const admCmsFullPreviewPage =
  "flex min-h-screen flex-col bg-[#f5f5f5]";

export const admCmsFullPreviewBar =
  "flex flex-wrap items-center gap-4 border-b border-[#ddd] bg-white px-4 py-3 [&_h1]:m-0 [&_h1]:flex-1 [&_h1]:text-lg";

export const admCmsDraftPreview =
  "overflow-hidden rounded-lg border border-[#ddd] bg-[var(--card)]";

export const admCmsDraftPreviewFull = "rounded-none border-0";

export const admCmsDraftPreviewHeader =
  "flex items-center gap-3 px-4 py-3";

export const admCmsDraftPreviewLogo = "h-10 w-auto";

export const admCmsDraftPreviewTagline =
  "ml-2 text-[0.8rem] opacity-90";

export const admCmsDraftPreviewHero =
  "bg-cover bg-center";

export const admCmsDraftPreviewHeroTall = "h-48";

export const admCmsDraftPreviewHeroPlaceholder =
  "flex h-32 items-center justify-center bg-[#eee] text-[0.875rem] text-[#888]";

export const admCmsDraftPreviewGallery =
  "flex gap-2 overflow-x-auto p-4";

export const admCmsDraftPreviewGalleryItem =
  "h-20 w-32 shrink-0 rounded bg-cover bg-center";

export const admCmsDraftPreviewFooter =
  "flex flex-wrap gap-4 border-t border-[#eee] bg-[#fafafa] px-4 py-3 text-[0.8rem] text-[#555]";

export const admCmsDraftPreviewPowered =
  "ml-auto text-[0.75rem] text-[#888]";

/** Combine adm form field + label + input classes for field wrappers. */
export function admFieldClass(...extra: string[]) {
  return [admFormField, ...extra].filter(Boolean).join(" ");
}

export function admFieldLabelProps() {
  return { className: admFormFieldLabel };
}

export function admFieldInputClass() {
  return admFormFieldInput;
}
