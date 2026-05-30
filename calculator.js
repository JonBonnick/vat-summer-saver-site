/*
 * VAT Summer Saver — web calculator
 *
 * Mirrors VATEngine.swift / VATTypes.swift:
 *  - Standard VAT: 20%
 *  - Summer reduced VAT (25 Jun – 1 Sept 2026): 5%
 *  - HMRC penny rounding (VATREC12030): round half up at the pence boundary
 */

(function () {
  "use strict";

  const STANDARD_RATE = 0.20;
  const REDUCED_RATE = 0.05;
  const SUMMER_START = new Date("2026-06-25T00:00:00+01:00");
  const SUMMER_END = new Date("2026-09-01T23:59:59+01:00");

  const QUALIFIES_FOR_REDUCED = new Set([
    "childrensMealDineIn",
    "cinemaChildOrFamilyTicket",
    "theatreChildOrFamilyTicket",
    "attractionAdmission",
  ]);

  const CATEGORY_HINTS = {
    childrensMealDineIn:
      "Children's menu items for dine-in only. Takeaway and adult menu items are excluded.",
    cinemaChildOrFamilyTicket:
      "Child tickets and family tickets sold as one package including at least one child admission.",
    theatreChildOrFamilyTicket:
      "Children's and family tickets for theatre, concerts, shows or exhibitions.",
    attractionAdmission:
      "Admission to theme parks, water parks, museums, zoos, aquariums, soft play and similar.",
    other:
      "Not in the named categories — stays at 20% VAT.",
  };

  // ---------- Money helpers (HMRC penny rounding) ----------

  /** Round half up to nearest penny, matching Swift's NSDecimalRound .plain. */
  function roundToPence(amount) {
    return Math.round(amount * 100 + Number.EPSILON) / 100;
  }

  /** VAT on a net amount at a given rate, rounded to the nearest penny. */
  function hmrcVAT(netAmount, rate) {
    return roundToPence(netAmount * rate);
  }

  /** VAT included in a gross price at a given rate, rounded to the nearest penny. */
  function hmrcVATIncluded(grossAmount, rate) {
    return roundToPence((grossAmount / (1 + rate)) * rate);
  }

  const GBP = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function formatGBP(value) {
    return GBP.format(roundToPence(value));
  }

  function formatPercent(fraction) {
    return new Intl.NumberFormat("en-GB", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(fraction);
  }

  // ---------- Core calculation ----------

  function compute(amount, basis, category) {
    let netAmount;
    let standardVAT;
    let standardGross;

    if (basis === "gross") {
      standardGross = amount;
      standardVAT = hmrcVATIncluded(amount, STANDARD_RATE);
      netAmount = roundToPence(amount - standardVAT);
    } else {
      netAmount = amount;
      standardVAT = hmrcVAT(netAmount, STANDARD_RATE);
      standardGross = roundToPence(netAmount + standardVAT);
    }

    const qualifies = QUALIFIES_FOR_REDUCED.has(category);
    const reducedVAT = qualifies
      ? hmrcVAT(netAmount, REDUCED_RATE)
      : standardVAT;
    const reducedGross = roundToPence(netAmount + reducedVAT);
    const saving = roundToPence(standardGross - reducedGross);
    const savingPercent = standardGross === 0 ? 0 : saving / standardGross;

    return {
      netAmount,
      standardVAT,
      reducedVAT,
      standardGross,
      reducedGross,
      saving,
      savingPercent,
      qualifies,
    };
  }

  // ---------- Date window ----------

  function reliefWindowStatus(dateString) {
    if (!dateString) return "within";
    const d = new Date(dateString + "T12:00:00+01:00");
    if (Number.isNaN(d.getTime())) return "within";
    if (d < SUMMER_START) return "before";
    if (d > SUMMER_END) return "after";
    return "within";
  }

  function windowMessage(status, qualifies) {
    if (!qualifies) {
      return "This category isn't included in the summer scheme — VAT stays at 20%.";
    }
    if (status === "before") {
      return "This date is before the summer VAT relief window (25 Jun – 1 Sept 2026).";
    }
    if (status === "after") {
      return "This date is after the summer VAT relief window (25 Jun – 1 Sept 2026).";
    }
    return "Inside the summer VAT relief window — 5% applies.";
  }

  function reducedCardNote(status, qualifies) {
    if (!qualifies) {
      return "This category isn't included in the summer scheme. The price stays at 20% VAT.";
    }
    if (status === "before") {
      return "Outside the relief window (25 Jun – 1 Sept 2026). The 5% rate would apply if the supply happened during the window — change the date above to see it live.";
    }
    if (status === "after") {
      return "Outside the relief window (25 Jun – 1 Sept 2026). The 5% rate applied only during the window — change the date above to recalculate.";
    }
    return "";
  }

  // ---------- Input parsing ----------

  function sanitiseAmountInput(text) {
    let hasDecimalPoint = false;
    let fractionalDigits = 0;
    let result = "";

    for (const ch of text) {
      if (ch >= "0" && ch <= "9") {
        if (hasDecimalPoint) {
          if (fractionalDigits >= 2) continue;
          fractionalDigits += 1;
        }
        result += ch;
      } else if ((ch === "." || ch === ",") && !hasDecimalPoint) {
        hasDecimalPoint = true;
        result += ".";
      }
    }
    return result;
  }

  function parseAmount(text) {
    const sanitized = sanitiseAmountInput(text);
    if (!sanitized || sanitized === ".") return 0;
    const value = Number(sanitized);
    return Number.isFinite(value) ? value : 0;
  }

  // ---------- DOM wiring ----------

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  const els = {
    form: $("#vat-form"),
    amount: $("#amount"),
    basisGross: $("#basis-gross"),
    basisNet: $("#basis-net"),
    category: $("#category"),
    date: $("#date"),
    categoryHint: $('[data-role="category-hint"]'),
    dateHint: $('[data-role="date-hint"]'),
    standardGross: $('[data-role="standard-gross"]'),
    standardNet: $('[data-role="standard-net"]'),
    standardVat: $('[data-role="standard-vat"]'),
    reducedCard: $('[data-role="reduced-card"]'),
    reducedGross: $('[data-role="reduced-gross"]'),
    reducedNet: $('[data-role="reduced-net"]'),
    reducedVat: $('[data-role="reduced-vat"]'),
    reducedNote: $('[data-role="reduced-note"]'),
    saving: $('[data-role="saving"]'),
    savingPercent: $('[data-role="saving-percent"]'),
    quickCheck: $('[data-role="quick-check"]'),
    year: $("#year"),
  };

  function render() {
    const amount = parseAmount(els.amount.value);
    const basis = els.basisGross.checked ? "gross" : "net";
    const category = els.category.value;
    const status = reliefWindowStatus(els.date.value);
    const inWindow = status === "within";

    const result = compute(amount, basis, category);
    const qualifies = result.qualifies;
    const showReducedNormally = inWindow && qualifies;
    const showReducedStruck = qualifies && !inWindow;

    els.standardGross.textContent = formatGBP(result.standardGross);
    els.standardNet.textContent = formatGBP(result.netAmount);
    els.standardVat.textContent = formatGBP(result.standardVAT);

    if (showReducedNormally) {
      els.reducedGross.textContent = formatGBP(result.reducedGross);
      els.reducedVat.textContent = formatGBP(result.reducedVAT);
      els.saving.textContent = formatGBP(result.saving);
      els.savingPercent.textContent = formatPercent(result.savingPercent);
    } else if (showReducedStruck) {
      els.reducedGross.textContent = formatGBP(result.reducedGross);
      els.reducedVat.textContent = formatGBP(result.reducedVAT);
      els.saving.textContent = formatGBP(0);
      els.savingPercent.textContent = formatPercent(0);
    } else {
      els.reducedGross.textContent = formatGBP(result.standardGross);
      els.reducedVat.textContent = formatGBP(result.standardVAT);
      els.saving.textContent = formatGBP(0);
      els.savingPercent.textContent = formatPercent(0);
    }
    els.reducedNet.textContent = formatGBP(result.netAmount);

    els.reducedCard.classList.toggle("is-not-applied", showReducedStruck);
    els.reducedCard.classList.toggle("is-ineligible", !qualifies);

    const note = reducedCardNote(status, qualifies);
    if (note) {
      els.reducedNote.textContent = note;
      els.reducedNote.hidden = false;
    } else {
      els.reducedNote.textContent = "";
      els.reducedNote.hidden = true;
    }

    const quickCheck = basis === "gross"
      ? `${formatGBP(amount)} × 15 ÷ 120 = ${formatGBP((amount * 15) / 120)}`
      : `net × 0.15 = ${formatGBP(result.netAmount * 0.15)}`;
    els.quickCheck.textContent = quickCheck;

    els.categoryHint.textContent = CATEGORY_HINTS[category] || "";
    els.dateHint.textContent = windowMessage(status, result.qualifies);
  }

  // Live formatting of the amount field
  els.amount.addEventListener("input", (event) => {
    const cleaned = sanitiseAmountInput(event.target.value);
    if (cleaned !== event.target.value) {
      event.target.value = cleaned;
    }
    render();
  });

  ["change", "input"].forEach((eventName) => {
    els.form.addEventListener(eventName, (event) => {
      if (event.target === els.amount) return;
      render();
    });
  });

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });

  if (els.year) {
    els.year.textContent = String(new Date().getFullYear());
  }

  if (!els.date.value) {
    els.date.value = "2026-07-15";
  }

  render();
})();
