# The maths — why "subtract 15%" is wrong

> Markdown version of <https://summervatcalculator.co.uk/maths/>.
> Publisher: Intelligenti Ltd. Last updated: 30 May 2026.

During the **UK Great British Summer Savings VAT relief**
(25 June – 1 September 2026), VAT on qualifying supplies drops from
**20% to 5%** — a 15 percentage-point reduction. The common mistake is
to take 15% off the till price. That gives the wrong answer because
VAT sits on the *net* price, not as a slice of the total.

## Worked example — a £120 till price

1. **Strip the 20% VAT.** £120 ÷ 1.20 = £100 (net).
2. **Add 5% VAT.** £100 × 1.05 = £105. Summer price **£105.00**.
3. **Saving.** £120 − £105 = **£15.00**.

The wrong shortcut (15% off): £120 × 0.85 = £102.00 — **too low by £3**.

## The correct one-step shortcut

Multiply the till price by **0.875** (take 12.5% off).

```
1.05  ÷  1.20  =  0.875
(new gross multiplier) ÷ (old gross multiplier)
```

So `£120 × 0.875 = £105`. Same answer, one multiplication.

## Quick saving check

On a VAT-inclusive till price the customer saving is:

```
saving  =  price × 15 ÷ 120
£120 × 15 ÷ 120  =  £15  ✓
```

## HMRC penny rounding

All calculations on this site follow HMRC's rounding rule for VAT per
line item (notice VATREC12030): VAT is calculated on the net amount at
the appropriate rate and rounded to the nearest penny, half up. Net
and gross are derived consistently so totals match a compliant till.

## Try it

Interactive calculator: <https://summervatcalculator.co.uk/#calculator>.
iOS app: <https://apps.apple.com/app/id6774140450>.
