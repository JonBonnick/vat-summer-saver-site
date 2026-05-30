#!/usr/bin/env python3
"""
Regenerate web/images/app-store-qr.svg.

The QR encodes a direct App Store URL with Apple campaign parameters so
QR-scanned installs surface in App Store Connect:
    App Analytics -> Sources -> Campaigns -> ct=web_qr

When you swap PROVIDER_TOKEN for the real Apple Provider ID (App Store
Connect -> Users and Access -> Integrations -> "Provider ID"), rerun
this script from the repo root:

    python3 web/images/regenerate-qr.py

Density notes
-------------
We encode at error correction level M (15% recovery) which keeps the
output at QR version 4 or 5 even when pt grows to a 9-digit value.
Higher levels (Q/H) push the version higher and make the QR visibly
denser. M is fine for a website-displayed code; if you ever print this
QR on physical material that might be scuffed or photocopied, bump
error to "h" and accept the denser pattern.
"""

import segno
import os

PROVIDER_TOKEN = "1"  # <-- replace with your real Apple Provider ID
APP_ID = "6774140450"
CAMPAIGN = "web_qr"

URL = (
    f"https://apps.apple.com/app/id{APP_ID}"
    f"?pt={PROVIDER_TOKEN}&ct={CAMPAIGN}&mt=8"
)

OUT_PATH = os.path.join(os.path.dirname(__file__), "app-store-qr.svg")


def main() -> None:
    qr = segno.make(URL, error="m", micro=False)

    print(f"Encoded URL ({len(URL)} chars): {URL}")
    print(f"QR designator: {qr.designator}")
    modules = qr.symbol_size(scale=1, border=0)[0]
    rendered = qr.symbol_size(scale=10, border=2)[0]
    print(f"Modules per side: {modules}")
    print(f"Native px (scale 10 + border 2): {rendered}")

    qr.save(
        OUT_PATH,
        kind="svg",
        scale=10,
        dark="#13213a",
        light=None,
        border=2,
        title="Download Summer VAT Calculator on the App Store",
        desc=f"QR code linking to {URL}",
        svgclass="segno",
        lineclass="qrline",
        omitsize=False,
        xmldecl=True,
        svgns=True,
        nl=False,
    )

    print(f"Wrote {OUT_PATH} ({os.path.getsize(OUT_PATH)} bytes)")


if __name__ == "__main__":
    main()
