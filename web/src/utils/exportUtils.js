// Export utilities for CSV and PDF generation
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import SarabunRegular from "@/assets/font/Sarabun-Regular-normal.js";
import SarabunBold from "@/assets/font/Sarabun-Bold-bold.js";

// Thai font support - using Sarabun font
const addThaiFontSupport = (doc) => {
  try {
    // Add Sarabun Regular font to VFS
    doc.addFileToVFS('Sarabun-Regular.ttf', SarabunRegular)
    doc.addFont('Sarabun-Regular.ttf', 'Sarabun-Regular', 'normal')
    
    // Add Sarabun Bold font to VFS
    doc.addFileToVFS('Sarabun-Bold.ttf', SarabunBold)
    doc.addFont('Sarabun-Bold.ttf', 'Sarabun-Bold', 'bold')
    
    // Set default font
    doc.setFont('Sarabun-Regular', 'normal')
    
  } catch (error) {
    console.warn('Failed to load Thai fonts:', error)
    // Fallback to helvetica
    doc.setFont('helvetica', 'normal')
  }
  
  return doc
}

// Convert Thai text to a format that can be displayed in PDF
const convertThaiText = (text) => {
  if (!text) return ''
  
  // With Sarabun font, Thai text should display correctly
  return text
}

// CSV Export Functions
export const exportToCSV = (data, filename, headers) => {
  try {
    // Create CSV headers
    const csvHeaders = headers.map(h => h.label || h.key).join(',')
    
    // Create CSV rows
    const csvRows = data.map(item => {
      return headers.map(header => {
        let value = item[header.key]
        
        // Format value based on type
        if (header.type === 'date') {
          value = value ? new Date(value).toLocaleDateString('th-TH') : ''
        } else if (header.type === 'number') {
          value = value ? Number(value).toLocaleString('en-US') : '0'
        } else if (header.type === 'currency') {
          value = value ? Number(value).toLocaleString('th-TH', {
            style: 'currency',
            currency: 'THB'
          }) : '฿0'
        } else if (header.type === 'percentage') {
          value = value ? `${value}%` : '0%'
        } else if (header.type === 'status') {
          // Keep status as is for CSV
          value = value || ''
        } else if (typeof value === 'string' && value.includes(',')) {
          // Escape commas in strings
          value = `"${value}"`
        }
        
        return value || ''
      }).join(',')
    })
    
    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows].join('\n')
    
    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    return { success: true, message: 'Export CSV สำเร็จ' }
  } catch (error) {
    console.error('CSV Export Error:', error)
    return { success: false, message: 'ไม่สามารถ export CSV ได้' }
  }
}

// PDF Export Functions
export const exportToPDF = (data, filename, title, headers) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4') // Landscape orientation
    
    // Add Thai font support
    addThaiFontSupport(doc)
    
    // Add title
    doc.setFontSize(16)
    doc.text(convertThaiText(title), 14, 22)
    
    // Add export date
    doc.setFontSize(10)
    doc.text(convertThaiText(`วันที่ export: ${new Date().toLocaleDateString('th-TH')}`), 14, 30)
    
    // Add total count
    doc.text(convertThaiText(`จำนวนรายการ: ${data.length} รายการ`), 14, 36)
    
    // Prepare table data
    const tableHeaders = headers.map(h => convertThaiText(h.label || h.key))
    const tableRows = data.map(item => {
      return headers.map(header => {
        let value = item[header.key]
        
        // Format value based on type
        if (header.type === 'date') {
          value = value ? new Date(value).toLocaleDateString('th-TH') : ''
        } else if (header.type === 'number') {
          value = value ? Number(value).toLocaleString('th-TH') : '0'
        } else if (header.type === 'currency') {
          value = value ? Number(value).toLocaleString('th-TH', {
            style: 'currency',
            currency: 'THB'
          }) : '฿0'
        } else if (header.type === 'percentage') {
          value = value ? `${value}%` : '0%'
        } else if (header.type === 'status') {
          // Keep status as is for PDF
          value = value || ''
        }
        
        return convertThaiText(value || '')
      })
    })
    
    // Add table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
        font: 'Sarabun-Regular',
        lineColor: [0, 0, 0], // Black border lines
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: false, // No background color
        textColor: [0, 0, 0], // Black text
        fontStyle: 'bold',
        font: 'Sarabun-Bold',
        lineColor: [0, 0, 0], // Black border lines
        lineWidth: 0.1,
        overflow: 'visible' // No wrap for header
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Light gray
        lineColor: [0, 0, 0], // Black border lines
        lineWidth: 0.1
      },
      columnStyles: {
        // Adjust column widths based on content
        0: { cellWidth: 40 }, // Title
        1: { cellWidth: 35 }, // Description
        2: { cellWidth: 20, overflow: 'visible', halign: 'right' }, // Target Value - no wrap, right align
        3: { cellWidth: 20, overflow: 'visible', halign: 'right' }, // Actual Value - no wrap, right align
        4: { cellWidth: 15, overflow: 'visible' }, // Status - no wrap
        5: { cellWidth: 25 }, // Assigned User
        6: { cellWidth: 30 }, // Start & End Date
      }
    })
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(convertThaiText(`หน้า ${i} จาก ${pageCount}`), 14, doc.internal.pageSize.height - 10)
    }
    
    // Save PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`)
    
    return { success: true, message: 'Export PDF สำเร็จ' }
  } catch (error) {
    console.error('PDF Export Error:', error)
    return { success: false, message: 'ไม่สามารถ export PDF ได้' }
  }
}

// KPI specific export functions
export const exportKPIHeaders = [
  { key: 'title', label: 'title', type: 'text' },
  { key: 'description', label: 'description', type: 'text' },
  { key: 'target_value', label: 'target_value', type: 'text' },
  { key: 'actual_value', label: 'actual_value', type: 'text' },
  { key: 'status', label: 'status', type: 'status' },
  { key: 'assigned_user', label: 'assigned_user', type: 'text' },
  { key: 'date_range', label: 'date_range', type: 'text' }
]

export const exportUserHeaders = [
  { key: 'username', label: 'ชื่อผู้ใช้', type: 'text' },
  { key: 'email', label: 'อีเมล', type: 'text' },
  { key: 'role_name', label: 'สิทธิ์', type: 'text' },
  { key: 'createdAt', label: 'วันที่สร้าง', type: 'date' },
  { key: 'updatedAt', label: 'วันที่อัปเดต', type: 'date' }
]

// Export KPI data
export const exportKPIData = (kpiData, format = 'csv', filename = 'KPI_Report') => {
  const title = 'รายงาน KPI'
  const headers = exportKPIHeaders
  
  if (format === 'csv') {
    return exportToCSV(kpiData, filename, headers)
  } else if (format === 'pdf') {
    return exportToPDF(kpiData, filename, title, headers)
  }
  
  return { success: false, message: 'รูปแบบไฟล์ไม่ถูกต้อง' }
}

// Export User data
export const exportUserData = (userData, format = 'csv', filename = 'User_Report') => {
  const title = 'รายงานผู้ใช้งาน'
  const headers = exportUserHeaders
  
  if (format === 'csv') {
    return exportToCSV(userData, filename, headers)
  } else if (format === 'pdf') {
    return exportToPDF(userData, filename, title, headers)
  }
  
  return { success: false, message: 'รูปแบบไฟล์ไม่ถูกต้อง' }
}
