/** Shared Tailwind class strings for platform admin UI (replaces platform.css + admin shared classes). */

export const platformShellClass =
  "min-h-screen bg-[#f8f9fa]";

export const platformHeaderClass =
  "sticky top-0 z-50 bg-[#1e293b] text-white";

export const platformHeaderTopClass =
  "mx-auto flex max-w-[1200px] items-center justify-between px-8 py-2 text-[0.875rem] text-white/85 max-md:px-4";

export const platformHeaderTopRightClass =
  "flex items-center gap-5";

export const platformHeaderLogoutClass =
  "cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-white no-underline";

export const platformHeaderMainClass =
  "mx-auto flex max-w-[1200px] items-center justify-between gap-4 border-t border-white/10 px-8 py-2 max-md:px-4";

export const platformBadgeClass =
  "inline-block rounded px-2.5 py-1 text-[0.75rem] font-bold tracking-widest text-white uppercase bg-[#2e7d32]";

export const platformShellTitleClass =
  "m-0 text-[1.1rem] font-bold text-white";

export const platformNavClass =
  "ml-auto flex flex-wrap items-center gap-x-[0.9rem] gap-y-[0.15rem] max-md:hidden";

export const platformNavBtnClass =
  "cursor-pointer border-0 border-b-[3px] border-transparent bg-transparent px-0 pb-[0.35rem] font-[inherit] text-[0.9rem] whitespace-nowrap text-white/85 hover:text-white";

export const platformNavBtnActiveClass =
  "cursor-pointer border-0 border-b-[3px] border-[#c62828] bg-transparent px-0 pb-[0.35rem] font-[inherit] text-[0.9rem] whitespace-nowrap text-white";

export const cpSectionClass =
  "mx-auto box-border max-w-[1200px] px-8 pb-10 max-md:px-4";

export const admPageTitleClass =
  "my-4 mb-5 border border-[#d5d5d5] border-l-4 border-l-[var(--primary,#2e7d32)] bg-white px-4 py-2.5 text-[0.95rem] font-bold tracking-wide text-[#222] shadow-[0_1px_4px_rgba(0,0,0,0.05)]";

export const admKpiGridClass =
  "mb-6 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1";

export const admKpiCardClass =
  "relative rounded border border-[#d5d5d5] border-t-[3px] border-t-[var(--primary,#2e7d32)] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(46,125,50,0.12)] [&_label]:mb-[0.45rem] [&_label]:block [&_label]:text-[0.7rem] [&_label]:font-bold [&_label]:tracking-widest [&_label]:text-[#777] [&_label]:uppercase [&_strong]:block [&_strong]:text-[1.55rem] [&_strong]:leading-tight [&_strong]:font-extrabold [&_strong]:text-[#c62828] [&_span]:mt-[0.35rem] [&_span]:block [&_span]:border-t [&_span]:border-dashed [&_span]:border-[#e8e8e8] [&_span]:pt-[0.35rem] [&_span]:text-[0.78rem] [&_span]:text-[#666]";

export const filterErrorClass = "my-[0.35rem] text-[0.85rem] text-[var(--danger)]";

export const platformLoadingClass = "py-12 text-center text-[#6b7280]";

export const platformErrorClass =
  "mb-4 rounded-md border border-[#fca5a5] bg-[#fef2f2] px-5 py-4 text-[#b91c1c]";

export const platformTableWrapClass =
  "overflow-auto rounded-lg border border-[#e5e7eb] bg-white";

export const platformTableClass =
  "w-full border-collapse text-[0.9rem] [&_th]:border-b [&_th]:border-[#e5e7eb] [&_th]:bg-[#f9fafb] [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-[0.75rem] [&_th]:font-semibold [&_th]:tracking-wide [&_th]:text-[#6b7280] [&_th]:uppercase [&_td]:border-b [&_td]:border-[#f3f4f6] [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_tr:last-child_td]:border-b-0 [&_code]:rounded [&_code]:bg-[#f3f4f6] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.8rem] [&_code]:text-[#374151]";

export const platformTableRowClickClass =
  "cursor-pointer [&_td]:hover:bg-[#f9fafb]";

export const platformEmptyClass = "m-0 py-12 text-center text-[#9ca3af]";

export const platformSectionTitleClass =
  "mb-3 text-[0.85rem] font-bold tracking-wide text-[#374151] uppercase";

export const platformLinkClass =
  "text-[0.875rem] font-medium text-[var(--primary,#2e7d32)] no-underline hover:underline";

export const platformBtnClass =
  "inline-flex cursor-pointer items-center rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-[0.875rem] font-semibold text-inherit no-underline";

export const platformBtnPrimaryClass =
  "inline-flex cursor-pointer items-center rounded-md border border-[var(--primary,#2e7d32)] bg-[var(--primary,#2e7d32)] px-4 py-2 text-[0.875rem] font-semibold text-white no-underline";

export const platformBtnDangerClass =
  "inline-flex cursor-pointer items-center rounded-md border border-[#c62828] bg-[#c62828] px-4 py-2 text-[0.875rem] font-semibold text-white";

export const platformBtnSmClass =
  "inline-flex cursor-pointer items-center rounded-md border border-[#d1d5db] bg-white px-2 py-1 text-[0.8rem] font-semibold";

export const platformPanelHeadClass =
  "flex flex-wrap items-center justify-between gap-4";

export const platformFiltersClass =
  "mb-4 flex flex-wrap gap-3 [&_input]:rounded-md [&_input]:border [&_input]:border-[#d1d5db] [&_input]:bg-white [&_input]:px-[0.65rem] [&_input]:py-[0.45rem] [&_input]:text-[0.875rem] [&_select]:rounded-md [&_select]:border [&_select]:border-[#d1d5db] [&_select]:bg-white [&_select]:px-[0.65rem] [&_select]:py-[0.45rem] [&_select]:text-[0.875rem]";

export const platformSearchClass =
  "min-w-[200px] flex-1 rounded-md border border-[#d1d5db] bg-white px-[0.65rem] py-[0.45rem] text-[0.875rem]";

export const platformPaginationClass =
  "mt-4 flex items-center justify-center gap-4 text-[0.875rem] [&_button]:cursor-pointer [&_button]:rounded-md [&_button]:border [&_button]:border-[#d1d5db] [&_button]:bg-white [&_button]:px-3 [&_button]:py-[0.35rem] [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-50";

export const platformTwoColClass =
  "mt-6 grid grid-cols-[1.4fr_1fr] gap-6 max-[900px]:grid-cols-1";

export const platformPlanBarsClass = "flex flex-col gap-3";

export const platformPlanBarRowClass =
  "grid grid-cols-[5rem_1fr_auto] items-center gap-3";

export const platformPlanBarLabelClass = "text-[0.8rem] font-semibold";

export const platformPlanBarTrackClass =
  "h-[0.65rem] overflow-hidden rounded-full bg-[#e5e7eb]";

export const platformPlanBarFillClass = "h-full min-w-0.5 rounded-full";

export const platformPlanBarMetaClass =
  "text-[0.75rem] whitespace-nowrap text-[#6b7280]";

export const platformAlertsClass = "my-5";

export const platformAlertListClass =
  "m-0 flex list-none flex-col gap-2 p-0";

export const platformAlertClass = "rounded-md px-4 py-[0.65rem] text-[0.875rem]";

export const platformAlertInfoClass = `${platformAlertClass} bg-[#e3f2fd] text-[#1565c0]`;
export const platformAlertWarningClass = `${platformAlertClass} bg-[#fff3e0] text-[#e65100]`;
export const platformAlertDangerClass = `${platformAlertClass} bg-[#ffebee] text-[#c62828]`;

export const platformModalOverlayClass =
  "fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4";

export const platformModalClass =
  "flex w-full max-w-[420px] flex-col gap-3 rounded-lg bg-white p-6 [&_h3]:m-0 [&_h3]:mb-2 [&_input]:rounded-md [&_input]:border [&_input]:border-[#d1d5db] [&_input]:px-[0.65rem] [&_input]:py-[0.45rem] [&_input]:font-normal [&_label]:flex [&_label]:flex-col [&_label]:gap-[0.35rem] [&_label]:text-[0.875rem] [&_label]:font-semibold [&_select]:rounded-md [&_select]:border [&_select]:border-[#d1d5db] [&_select]:px-[0.65rem] [&_select]:py-[0.45rem] [&_select]:font-normal [&_textarea]:w-full [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[#d1d5db] [&_textarea]:px-[0.65rem] [&_textarea]:py-[0.45rem] [&_textarea]:font-[inherit] [&_textarea]:font-normal";

export const platformModalWideClass =
  "flex w-full max-w-[640px] flex-col gap-3 rounded-lg bg-white p-6 [&_h3]:m-0 [&_h3]:mb-2 [&_input]:rounded-md [&_input]:border [&_input]:border-[#d1d5db] [&_input]:px-[0.65rem] [&_input]:py-[0.45rem] [&_input]:font-normal [&_label]:flex [&_label]:flex-col [&_label]:gap-[0.35rem] [&_label]:text-[0.875rem] [&_label]:font-semibold [&_select]:rounded-md [&_select]:border [&_select]:border-[#d1d5db] [&_select]:px-[0.65rem] [&_select]:py-[0.45rem] [&_select]:font-normal [&_textarea]:w-full [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[#d1d5db] [&_textarea]:px-[0.65rem] [&_textarea]:py-[0.45rem] [&_textarea]:font-[inherit] [&_textarea]:font-normal";

export const platformModalActionsClass =
  "mt-2 flex justify-end gap-2";

export const platformMetaClass =
  "mb-4 text-[0.875rem] text-[#6b7280]";

export const platformAuditDetailClass =
  "m-0 max-h-[200px] overflow-auto rounded-md bg-[#f3f4f6] p-3 text-[0.75rem]";

export const platformBulkBarClass =
  "mb-3 flex items-center gap-3 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 [&_button]:cursor-pointer [&_button]:rounded-md [&_button]:border [&_button]:border-[#d1d5db] [&_button]:bg-white [&_button]:px-3 [&_button]:py-[0.35rem] [&_button]:text-[0.875rem]";

export const platformTicketThreadClass =
  "mb-4 flex max-h-[280px] flex-col gap-3 overflow-y-auto";

export const platformTicketMessageClass =
  "rounded-md bg-[#f9fafb] p-3 text-[0.875rem] [&_p]:mt-2 [&_p]:mb-0 [&_p]:whitespace-pre-wrap [&_span]:text-[0.75rem] [&_span]:text-[#6b7280] [&_strong]:block";

export const cpTableWrapClass = "overflow-x-auto";

export const cpTableClass =
  "w-full border-collapse text-[0.875rem] [&_td]:border-b [&_td]:border-[#eee] [&_td]:px-3 [&_td]:py-2 [&_th]:border-b [&_th]:border-[#ddd] [&_th]:bg-[#f9fafb] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-[0.75rem] [&_th]:font-semibold [&_th]:text-[#666] [&_th]:uppercase";

export const platformDetailPageClass = "min-h-screen bg-white";

export const platformDetailHeaderClass =
  "border-b border-[#e5e7eb] px-8 py-4 max-md:px-4";

export const platformDetailMetaClass =
  "-mt-2 mb-5 text-[#6b7280]";

export const platformDetailGridClass =
  "mb-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4";

export const platformDetailCardClass =
  "rounded-lg border border-[#e5e7eb] bg-white px-5 py-4 [&_h3]:m-0 [&_h3]:mb-3 [&_h3]:text-[0.85rem] [&_h3]:tracking-wide [&_h3]:uppercase";

export const platformDlClass =
  "m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-[0.35rem] text-[0.875rem] [&_dd]:m-0 [&_dt]:font-semibold [&_dt]:text-[#6b7280]";

export const platformDetailActionsClass =
  "mt-6 flex flex-wrap gap-3";

export const platformFormClass =
  "flex flex-col gap-3 [&_input]:rounded-md [&_input]:border [&_input]:border-[#d1d5db] [&_input]:px-[0.65rem] [&_input]:py-[0.45rem] [&_label]:text-[0.875rem] [&_label]:font-semibold [&_select]:rounded-md [&_select]:border [&_select]:border-[#d1d5db] [&_select]:px-[0.65rem] [&_select]:py-[0.45rem]";

export const BADGE_COLORS: Record<string, string> = {
  "badge-grey": "rounded-full bg-[#f3f4f6] px-3 py-1 text-[0.75rem] font-semibold text-[#374151]",
  "badge-blue": "rounded-full bg-[#dbeafe] px-3 py-1 text-[0.75rem] font-semibold text-[#1d4ed8]",
  "badge-purple": "rounded-full bg-[#ede9fe] px-3 py-1 text-[0.75rem] font-semibold text-[#6d28d9]",
  "badge-yellow": "rounded-full bg-[#fef3c7] px-3 py-1 text-[0.75rem] font-semibold text-[#92400e]",
  "badge-green": "rounded-full bg-[#d1fae5] px-3 py-1 text-[0.75rem] font-semibold text-[#065f46]",
  "badge-red": "rounded-full bg-[#fee2e2] px-3 py-1 text-[0.75rem] font-semibold text-[#991b1b]",
};

export function badgeClass(name: string): string {
  return BADGE_COLORS[name] ?? BADGE_COLORS["badge-grey"];
}

/** Colored select styled like status badges (tenant plan/status dropdowns). */
export function badgeSelectClass(name: string): string {
  return `${badgeClass(name)} cursor-pointer appearance-none border-0 bg-no-repeat pr-7 [background-image:url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2020%2020'%20fill='%236b7280'%3E%3Cpath%20fill-rule='evenodd'%20d='M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z'%20clip-rule='evenodd'/%3E%3C/svg%3E")] [background-position:right_0.4rem_center] [background-size:1rem]`;
}

export function alertClass(severity: string): string {
  if (severity === "warning") return platformAlertWarningClass;
  if (severity === "danger") return platformAlertDangerClass;
  return platformAlertInfoClass;
}
