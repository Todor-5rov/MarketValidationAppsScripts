function analyzeResponses(spreadsheetUrl) {
  // Extract the spreadsheet ID from the URL
  var spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    Logger.log("Invalid spreadsheet URL.");
    return;
  }

  // Open the spreadsheet using the extracted ID
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getActiveSheet(); // Get the active sheet (or specify by name)
  var data = sheet.getDataRange().getValues(); // Get all the data

  var totalResponses = data.length - 1; // Subtract header row
  Logger.log("Total Responses: " + totalResponses);

  // Initialize an array to hold summaries for each question
  var questionSummaries = [];

  // Loop through responses and calculate statistics for each question
  for (var questionIndex = 1; questionIndex < data[0].length; questionIndex++) { // Skip header row
    var summary = {};
    
    for (var i = 1; i < data.length; i++) {
      var response = data[i][questionIndex]; // Get the response for the current question
      
      // Count occurrences of each unique response
      if (summary[response]) {
        summary[response]++;
      } else {
        summary[response] = 1;
      }
    }

    // Store summary for the current question
    questionSummaries.push({
      question: data[0][questionIndex], // Get question text from header
      summary: summary
    });
  }

  // Log the summaries to the Logger
  questionSummaries.forEach(function(q) {
    Logger.log("Question: " + q.question);
    Logger.log("Response Summary: " + JSON.stringify(q.summary));
  });

  // Return the question summaries
  return {
    totalResponses: totalResponses,
    questionSummaries: questionSummaries
  };
}

function extractSpreadsheetId(url) {
  var regex = /[-\w]{25,}/; // Regular expression to find the spreadsheet ID
  var matches = url.match(regex);
  return matches ? matches[0] : null;
}

function doPost(e) {
  // Check if the POST request contains a valid JSON body
  if (!e.postData.contents) {
    return ContentService.createTextOutput("Invalid request: No data provided.").setMimeType(ContentService.MimeType.TEXT);
  }

  // Parse the incoming request data
  var params = JSON.parse(e.postData.contents);
  
  // Call the analyzeResponses function with the provided spreadsheet URL
  var result = analyzeResponses(params.spreadsheetUrl);
  
  // Return the result as a JSON response
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}