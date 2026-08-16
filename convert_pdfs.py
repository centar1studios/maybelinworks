from pathlib import Path
import fitz

assets = Path("public/assets")

for pdf_path in assets.rglob("*.pdf"):
    print(f"Converting: {pdf_path}")

    document = fitz.open(pdf_path)

    output_folder = pdf_path.parent / f"{pdf_path.stem}_pages"
    output_folder.mkdir(exist_ok=True)

    for page_number, page in enumerate(document, start=1):
        pixmap = page.get_pixmap(dpi=160, alpha=False)

        output_path = output_folder / f"page_{page_number:02}.png"

        pixmap.save(output_path)

        print(f"  Created: {output_path}")

    document.close()

print("Done!")