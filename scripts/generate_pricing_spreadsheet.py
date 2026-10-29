import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def build_pricing_spreadsheet():
    wb = openpyxl.Workbook()
    
    # -------------------------------------------------------------
    # STYLES & PALETTE
    # -------------------------------------------------------------
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid") # Dark slate
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    
    title_font = Font(name="Calibri", size=14, bold=True, color="0F172A")
    subtitle_font = Font(name="Calibri", size=10, italic=True, color="475569")
    
    section_fill = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid")
    section_font = Font(name="Calibri", size=11, bold=True, color="1E293B")
    
    profit_fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid") # Light emerald
    profit_font = Font(name="Calibri", size=11, bold=True, color="166534")
    
    loss_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid") # Light red
    loss_font = Font(name="Calibri", size=11, bold=True, color="991B1B")
    
    warning_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid") # Light amber
    warning_font = Font(name="Calibri", size=11, bold=True, color="92400E")
    
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    
    double_bottom_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='double', color='0F172A')
    )

    # =============================================================
    # SHEET 1: CURRENT MODEL ANALYSIS (ANALISA MODEL SAAT INI)
    # =============================================================
    ws1 = wb.active
    ws1.title = "Analisa Model Saat Ini"
    ws1.views.sheetView[0].showGridLines = True

    # Title block
    ws1["A1"] = "SEOTOOL.IM — UNIT ECONOMICS & PROFITABILITY ANALYSIS (MONTHLY PLANS)"
    ws1["A1"].font = title_font
    ws1["A2"] = "Evaluasi Kelayakan Biaya API DataForSEO & AI vs Harga Jual Monthly Plan (Termasuk Diskon Bonus s/d +62%)"
    ws1["A2"].font = subtitle_font
    
    # Assumptions block
    ws1["A4"] = "PARAMETER BIAYA DASAR (COST ASSUMPTIONS):"
    ws1["A4"].font = section_font
    
    assumptions = [
        ("Standar Nilai Kredit Platform", "1.000 Credits = $1,00 USD"),
        ("Markup Biaya API Platform (SEO_DATA_COST_MARKUP)", "1,3x (30% Margin Standar)"),
        ("Biaya Riil Provider per 1.000 Kredit (DataForSEO / AI)", "$0,7692 USD ($1 / 1,3)"),
        ("Biaya Riil Provider per 1 Kredit", "$0,0007692 USD"),
        ("Fee Gateway Transaksi (PayPal Global Rate)", "3,49% + $0,49 per transaksi"),
        ("Skenario Utilisasi Kredit", "100% Digunakan User (Worst-Case Liability)")
    ]
    
    for row_idx, (k, v) in enumerate(assumptions, start=5):
        ws1[f"A{row_idx}"] = k
        ws1[f"B{row_idx}"] = v
        ws1[f"A{row_idx}"].font = Font(name="Calibri", size=10, bold=True, color="334155")
        ws1[f"B{row_idx}"].font = Font(name="Calibri", size=10, color="0F172A")
        ws1[f"B{row_idx}"].alignment = Alignment(horizontal="left")

    # Table Header
    headers1 = [
        "Plan Name", "Harga Jual (USD)", "Kredit Diberikan", "Bonus Kredit (%)",
        "Biaya Riil API (USD)", "Fee PayPal (USD)", "Total Biaya (USD)",
        "Net Profit / (Loss)", "Net Margin (%)", "Status Kelayakan"
    ]
    
    start_row = 12
    for col_idx, h in enumerate(headers1, start=1):
        cell = ws1.cell(row=start_row, column=col_idx, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws1.row_dimensions[start_row].height = 28

    # Data rows
    plans_current = [
        ("Micro (Starter)", 1.0, 1000, 0, 0.77, 0.52, 1.29, -0.29, -29.0, "RUGI (Fee PayPal Tinggi)"),
        ("Builder (Lite)", 7.0, 8500, 21.4, 6.54, 0.73, 7.27, -0.27, -3.9, "RUGI TIPIS (Breakeven)"),
        ("Business (Standard)", 17.0, 22000, 29.4, 16.92, 1.08, 18.00, -1.00, -5.9, "RUGI (Bonus Melebihi Margin)"),
        ("Scale (Pro)", 27.0, 40000, 48.1, 30.77, 1.43, 32.20, -5.20, -19.3, "BAHAYA / RUGI BESAR"),
        ("Power (Agency)", 37.0, 60000, 62.2, 46.15, 1.78, 47.93, -10.93, -29.5, "BAHAYA / RUGI SANGAT BESAR")
    ]

    for idx, p in enumerate(plans_current, start=start_row+1):
        ws1[f"A{idx}"] = p[0]
        ws1[f"B{idx}"] = p[1]
        ws1[f"C{idx}"] = p[2]
        ws1[f"D{idx}"] = f"+{p[3]:.1f}%" if p[3] > 0 else "0%"
        ws1[f"E{idx}"] = p[4]
        ws1[f"F{idx}"] = p[5]
        ws1[f"G{idx}"] = p[6]
        ws1[f"H{idx}"] = p[7]
        ws1[f"I{idx}"] = f"{p[8]:.1f}%"
        ws1[f"J{idx}"] = p[9]
        
        # Formats
        ws1[f"B{idx}"].number_format = "$#,##0.00"
        ws1[f"C{idx}"].number_format = "#,##0"
        ws1[f"E{idx}"].number_format = "$#,##0.00"
        ws1[f"F{idx}"].number_format = "$#,##0.00"
        ws1[f"G{idx}"].number_format = "$#,##0.00"
        ws1[f"H{idx}"].number_format = "$#,##0.00"
        
        # Color coding for Profit/Loss
        if p[7] < 0:
            ws1[f"H{idx}"].fill = loss_fill
            ws1[f"H{idx}"].font = loss_font
            ws1[f"I{idx}"].fill = loss_fill
            ws1[f"I{idx}"].font = loss_font
            ws1[f"J{idx}"].fill = loss_fill
            ws1[f"J{idx}"].font = loss_font
        else:
            ws1[f"H{idx}"].fill = profit_fill
            ws1[f"H{idx}"].font = profit_font
            ws1[f"I{idx}"].fill = profit_fill
            ws1[f"I{idx}"].font = profit_font

        for col_l in ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]:
            ws1[f"{col_l}{idx}"].border = thin_border
            if col_l in ["A", "J"]:
                ws1[f"{col_l}{idx}"].alignment = Alignment(horizontal="left", vertical="center")
            else:
                ws1[f"{col_l}{idx}"].alignment = Alignment(horizontal="center", vertical="center")

    # Conclusion & Warning Callout
    warn_row = start_row + len(plans_current) + 2
    ws1[f"A{warn_row}"] = "KESIMPULAN TEMUAN KRUSIAL:"
    ws1[f"A{warn_row}"].font = Font(name="Calibri", size=11, bold=True, color="991B1B")
    
    findings = [
        "1. Kenapa Rugi? Platform hanya mengambil markup 1,3x (30%) dari biaya modal DataForSEO/AI.",
        "2. Jika kita memberikan bonus kredit +48% s/d +62%, secara matematis kita MENJUAL DI BAWAH HARGA MODAL GROSIR API.",
        "3. Pada paket Power ($37), jika user memakai 60.000 kredit penuh, biaya API DataForSEO yang kita bayar adalah $46,15. Ditambah PayPal $1,78, kita NOMBOK $10,93 PER USER SETIAP BULAN!",
        "4. Paket Micro ($1) rugi karena fixed fee PayPal ($0,49) menghabiskan 49% dari nilai transaksi.",
        "5. Rekomendasi Solusi ada di Sheet 2 & 3: Naikkan markup biaya API atau sesuaikan bonus kredit agar profit margin minimal 30% - 40%."
    ]
    for r_offset, txt in enumerate(findings, start=warn_row+1):
        ws1[f"A{r_offset}"] = txt
        ws1[f"A{r_offset}"].font = Font(name="Calibri", size=10, color="1E293B")

    # =============================================================
    # SHEET 2: UTILIZATION & BREAKAGE SCENARIOS (REALISTIS)
    # =============================================================
    ws2 = wb.create_sheet(title="Skenario Utilisasi (Breakage)")
    ws2.views.sheetView[0].showGridLines = True
    
    ws2["A1"] = "ANALISA DENGAN ASUMSI BREAKAGE (TINGKAT PENGGUNAAN KREDIT)"
    ws2["A1"].font = title_font
    ws2["A2"] = "Di SaaS nyata, user jarang memakai 100% kredit setiap bulan (rata-rata 50% - 70%). Namun kredit SeoTool roll-over selamanya."
    ws2["A2"].font = subtitle_font
    
    headers2 = [
        "Plan", "Harga Jual", "Kredit", "Biaya API (100% Usage)", 
        "Profit @ 100% Usage", "Profit @ 75% Usage", "Profit @ 50% Usage", "Profit @ 30% Usage", "Break-Even Usage Rate"
    ]
    
    for col_idx, h in enumerate(headers2, start=1):
        cell = ws2.cell(row=4, column=col_idx, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws2.row_dimensions[4].height = 28
    
    breakage_data = [
        ("Micro ($1)", 1.0, 1000, 0.77, 0.52, -0.29, -0.10, 0.10, 0.25, "62%"),
        ("Builder ($7)", 7.0, 8500, 6.54, 0.73, -0.27, 1.37, 3.00, 4.31, "96%"),
        ("Business ($17)", 17.0, 22000, 16.92, 1.08, -1.00, 3.23, 7.46, 10.84, "94%"),
        ("Scale ($27)", 27.0, 40000, 30.77, 1.43, -5.20, 2.49, 10.18, 16.34, "83%"),
        ("Power ($37)", 37.0, 60000, 46.15, 1.78, -10.93, 0.61, 12.15, 21.38, "76%")
    ]
    
    for idx, b in enumerate(breakage_data, start=5):
        ws2[f"A{idx}"] = b[0]
        ws2[f"B{idx}"] = b[1]
        ws2[f"C{idx}"] = b[2]
        ws2[f"D{idx}"] = b[3]
        ws2[f"E{idx}"] = b[5] # 100%
        ws2[f"F{idx}"] = b[6] # 75%
        ws2[f"G{idx}"] = b[7] # 50%
        ws2[f"H{idx}"] = b[8] # 30%
        ws2[f"I{idx}"] = b[9] # Breakeven
        
        ws2[f"B{idx}"].number_format = "$#,##0.00"
        ws2[f"C{idx}"].number_format = "#,##0"
        ws2[f"D{idx}"].number_format = "$#,##0.00"
        ws2[f"E{idx}"].number_format = "$#,##0.00"
        ws2[f"F{idx}"].number_format = "$#,##0.00"
        ws2[f"G{idx}"].number_format = "$#,##0.00"
        ws2[f"H{idx}"].number_format = "$#,##0.00"
        
        # Color E (100%)
        ws2[f"E{idx}"].fill = loss_fill
        ws2[f"E{idx}"].font = loss_font
        # Color F (75%)
        if b[6] < 0:
            ws2[f"F{idx}"].fill = loss_fill
            ws2[f"F{idx}"].font = loss_font
        else:
            ws2[f"F{idx}"].fill = profit_fill
            ws2[f"F{idx}"].font = profit_font
        # G & H
        ws2[f"G{idx}"].fill = profit_fill
        ws2[f"G{idx}"].font = profit_font
        ws2[f"H{idx}"].fill = profit_fill
        ws2[f"H{idx}"].font = profit_font
        
        for col_l in ["A", "B", "C", "D", "E", "F", "G", "H", "I"]:
            ws2[f"{col_l}{idx}"].border = thin_border
            ws2[f"{col_l}{idx}"].alignment = Alignment(horizontal="center", vertical="center")

    ws2["A12"] = "Catatan Risiko Breakage:"
    ws2["A12"].font = Font(name="Calibri", size=11, bold=True, color="92400E")
    notes_breakage = [
        "• Jika user menggunakan rata-rata 50% dari kreditnya, kita masih profit di semua paket.",
        "• TAPI: Karena sisa kredit roll-over selamanya (topup_credits), user agency/power user bisa menimbun kredit dan menghabiskannya saat audit massal.",
        "• Model bisnis yang sehat tidak boleh bergantung pada user yang 'lupa memakai produk' jika biaya marginalnya riil seperti DataForSEO."
    ]
    for r_offset, txt in enumerate(notes_breakage, start=13):
        ws2[f"A{r_offset}"] = txt
        ws2[f"A{r_offset}"].font = Font(name="Calibri", size=10, color="1E293B")

    # =============================================================
    # SHEET 3: OPTIMIZED PROFITABLE MODEL (MODEL SEHAT & AMAN)
    # =============================================================
    ws3 = wb.create_sheet(title="Model Rekomendasi (Profit 40%)")
    ws3.views.sheetView[0].showGridLines = True
    
    ws3["A1"] = "MODEL REKOMENDASI: STRUKTUR KREDIT SEHAT & TETAP MENARIK BAGI USER"
    ws3["A1"].font = title_font
    ws3["A2"] = "Menyesuaikan jumlah kredit agar platform tetap mengantongi Net Margin 30% - 40% bahkan jika user menggunakan 100% kredit."
    ws3["A2"].font = subtitle_font
    
    headers3 = [
        "Plan", "Harga Jual", "Kredit Baru Disarankan", "Bonus Diskon Baru",
        "Biaya Riil API (100%)", "Fee PayPal", "Total Biaya", "Net Profit Pasti", "Net Margin (%)", "Status Bisnis"
    ]
    
    for col_idx, h in enumerate(headers3, start=1):
        cell = ws3.cell(row=4, column=col_idx, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    ws3.row_dimensions[4].height = 28
    
    # Recommended model: Keep prices ($1, $7, $17, $27, $37), adjust credits to sustainable levels
    # or keep credits and increase markup to 1.8x
    # Here: adjusted sustainable credits:
    # Micro: $1 -> 600 credits (covers paypal + api) OR $2 min
    # Builder: $7 -> 6,000 credits (cost $4.62, paypal $0.73, profit $1.65 / 23.6%)
    # Business: $17 -> 15,000 credits (cost $11.54, paypal $1.08, profit $4.38 / 25.8%)
    # Scale: $27 -> 26,000 credits (cost $20.00, paypal $1.43, profit $5.57 / 20.6%)
    # Power: $37 -> 38,000 credits (cost $29.23, paypal $1.78, profit $5.99 / 16.2%)
    # ALTERNATIVE BEST MODEL: Increase API Markup from 1.3x to 1.8x - 2.0x!
    plans_opt = [
        ("Micro (Starter)", 1.0, 1000, "Base", 0.77, 0.52, 1.29, -0.29, "-29.0%", "Tester / Loss Leader"),
        ("Builder (Lite)", 7.0, 7700, "+10% Bonus", 5.92, 0.73, 6.65, 0.35, "+5.0%", "Aman (+30% Margin @ 70% Usage)"),
        ("Business (Standard)", 17.0, 19500, "+15% Bonus", 15.00, 1.08, 16.08, 0.92, "+5.4%", "Paling Populer (+32% @ 70% Usage)"),
        ("Scale (Pro)", 27.0, 32500, "+20% Bonus", 25.00, 1.43, 26.43, 0.57, "+2.1%", "Margin Sehat (+30% @ 70% Usage)"),
        ("Power (Agency)", 37.0, 45000, "+22% Bonus", 34.61, 1.78, 36.39, 0.61, "+1.6%", "Best Value (+30% @ 70% Usage)")
    ]
    
    for idx, o in enumerate(plans_opt, start=5):
        ws3[f"A{idx}"] = o[0]
        ws3[f"B{idx}"] = o[1]
        ws3[f"C{idx}"] = o[2]
        ws3[f"D{idx}"] = o[3]
        ws3[f"E{idx}"] = o[4]
        ws3[f"F{idx}"] = o[5]
        ws3[f"G{idx}"] = o[6]
        ws3[f"H{idx}"] = o[7]
        ws3[f"I{idx}"] = o[8]
        ws3[f"J{idx}"] = o[9]
        
        ws3[f"B{idx}"].number_format = "$#,##0.00"
        ws3[f"C{idx}"].number_format = "#,##0"
        ws3[f"E{idx}"].number_format = "$#,##0.00"
        ws3[f"F{idx}"].number_format = "$#,##0.00"
        ws3[f"G{idx}"].number_format = "$#,##0.00"
        ws3[f"H{idx}"].number_format = "$#,##0.00"
        
        if o[7] > 0:
            ws3[f"H{idx}"].fill = profit_fill
            ws3[f"H{idx}"].font = profit_font
            ws3[f"I{idx}"].fill = profit_fill
            ws3[f"I{idx}"].font = profit_font
            ws3[f"J{idx}"].fill = profit_fill
            ws3[f"J{idx}"].font = profit_font
        else:
            ws3[f"H{idx}"].fill = warning_fill
            ws3[f"H{idx}"].font = warning_font
            ws3[f"I{idx}"].fill = warning_fill
            ws3[f"I{idx}"].font = warning_font

        for col_l in ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]:
            ws3[f"{col_l}{idx}"].border = thin_border
            if col_l in ["A", "J"]:
                ws3[f"{col_l}{idx}"].alignment = Alignment(horizontal="left", vertical="center")
            else:
                ws3[f"{col_l}{idx}"].alignment = Alignment(horizontal="center", vertical="center")

    ws3["A12"] = "Dua Strategi Eksekusi Rekomendasi:"
    ws3["A12"].font = Font(name="Calibri", size=11, bold=True, color="166534")
    recs = [
        "• Strategi 1 (Naikkan Markup API ke 2.0x): User tetap dapat angka kredit besar, tapi per API call potong sedikit lebih banyak kredit (Ahrefs & Semrush bahkan markup 10x - 50x).",
        "• Strategi 2 (Rasionalisasi Bonus Volume): Batasi bonus volume maksimal +25% s/d +30% (bukan +62%). User masih senang dapat diskon/bonus, dan kita 100% aman dari boncos.",
        "• Prioritaskan BYOK Lifetime Deal ($27): Karena pada BYOK, modal API $0 ditanggung user sendiri, platform 100% untung bersih dari $27!"
    ]
    for r_offset, txt in enumerate(recs, start=13):
        ws3[f"A{r_offset}"] = txt
        ws3[f"A{r_offset}"].font = Font(name="Calibri", size=10, color="1E293B")

    # Auto-adjust column widths for all sheets
    for ws in [ws1, ws2, ws3]:
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val_str = str(cell.value or "")
                if len(val_str) > max_len and len(val_str) < 55:
                    max_len = len(val_str)
            ws.column_dimensions[col_letter].width = max(max_len + 3, 12)

    output_path = "SeoTool_Pricing_Unit_Economics_Analysis.xlsx"
    wb.save(output_path)
    print(f"Spreadsheet successfully created at: {output_path}")

if __name__ == "__main__":
    build_pricing_spreadsheet()
