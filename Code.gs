const SHEET_NAME = 'Tickets';

// Helper function to get or setup the sheet automatically
function getOrSetupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Cannot access active spreadsheet. Are you sure this script is attached to a Google Sheet?");
  }
  
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // If 'Tickets' tab is not found, take the first tab and rename it
  if (!sheet) {
    sheet = ss.getSheets()[0];
    try {
      sheet.setName(SHEET_NAME);
    } catch(err) {
      // Ignore if rename fails (rare)
    }
  }
  
  // Check if it's empty, and create headers automatically if needed
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Ticket_ID", "Name", "Phone", "Training_ID", "Status", "Timestamp", "Checkin_Time"]);
    sheet.getRange("A1:G1").setFontWeight("bold");
  }
  
  return sheet;
}

// Handles GET requests: Used for fetching all tickets to sync with Dexie.js Local Database
function doGet(e) {
  if (e.parameter.action === 'getTickets') {
    try {
      const sheet = getOrSetupSheet();
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) {
         return ContentService.createTextOutput(JSON.stringify([]))
            .setMimeType(ContentService.MimeType.JSON);
      }
      
      const headers = data[0];
      const tickets = [];
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        let ticketObj = {};
        for (let j = 0; j < headers.length; j++) {
          ticketObj[headers[j]] = row[j];
        }
        tickets.push(ticketObj);
      }
      
      return ContentService.createTextOutput(JSON.stringify(tickets))
        .setMimeType(ContentService.MimeType.JSON);
        
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({"error": err.message}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({"status": "invalid_action"}))
      .setMimeType(ContentService.MimeType.JSON);
}

// Handles POST requests: Used for adding new tickets and updating ticket status
function doPost(e) {
  try {
    const sheet = getOrSetupSheet();

    // Support both fallback URL parameters and plain JSON payload body
    let data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    const action = data.action;

    if (action === 'addTicket') {
      const ticket_id = data.ticket_id;
      const name = data.name;
      const phone = data.phone;
      const training_id = data.training_id;
      const timestamp = new Date().toISOString();
      
      // ============================================
      // Duplicate Training ID Registration Check
      // ============================================
      if (training_id) {
        const checkId = String(training_id).trim().toLowerCase();
        const rangeData = sheet.getDataRange().getValues();
        
        // Start from 1 to skip headers
        for (let i = 1; i < rangeData.length; i++) {
          let existingId = String(rangeData[i][3]).trim().toLowerCase();
          if (existingId !== "" && existingId === checkId) {
            return ContentService.createTextOutput(JSON.stringify({
               "status": "error", 
               "message": "Training ID already exists in the Database!"
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      
      sheet.appendRow([
        ticket_id,
        name,
        phone,
        training_id,
        'Unused',
        timestamp,
        ''  // Checkin_Time - empty until scanned
      ]);

      return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Ticket added successfully"}))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else if (action === 'updateStatus') {
      const ticketId = data.ticket_id;
      const rangeData = sheet.getDataRange().getValues();
      
      let found = false;
      let alreadyUsed = false;
      
      for (let i = 1; i < rangeData.length; i++) {
        if (rangeData[i][0] === ticketId) { // Check Ticket_ID column
          if (rangeData[i][4] === 'Used') { // Status is now index 4
            alreadyUsed = true;
          } else {
            sheet.getRange(i + 1, 5).setValue('Used'); // Update Status column (E = 5)
            sheet.getRange(i + 1, 7).setValue(new Date().toISOString()); // Update Checkin_Time (G = 7)
          }
          found = true;
          break;
        }
      }
      
      if (!found) {
        return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Ticket not found"}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      if (alreadyUsed) {
         return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Ticket is already used!"}))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Ticket validated successfully!"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Invalid action"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
