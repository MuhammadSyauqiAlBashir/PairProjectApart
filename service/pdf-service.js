const PDFDocument = require('pdfkit')


function buildPDF(dataCallback, endCallback)  {
    const doc = new PDFDocument();
    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    doc.fontSize(50).text('Successfully Booking');
    doc.image('success.png', {
        fit: [300,350],
        align :"center",
        valign :"center"
    });
    doc.end();
}

module.exports = {buildPDF}