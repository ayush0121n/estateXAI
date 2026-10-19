try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    Write-Host "WORD_COM_AVAILABLE"
    $docPath = "C:\Users\ayush\OneDrive\Desktop\estateXAI\estateXAI_Project_Report.docx"
    $pdfPath = "C:\Users\ayush\OneDrive\Desktop\estateXAI\estateXAI_Project_Report.pdf"
    Write-Host "Opening $docPath..."
    $doc = $word.Documents.Open($docPath)
    Write-Host "Exporting to PDF: $pdfPath..."
    # 17 is wdExportFormatPDF
    $doc.ExportAsFixedFormat($pdfPath, 17)
    $doc.Close($false)
    $word.Quit()
    Write-Host "PDF_CONVERTED_SUCCESSFULLY"
} catch {
    Write-Host "WORD_CONVERSION_FAILED: $($_.Exception.Message)"
}
