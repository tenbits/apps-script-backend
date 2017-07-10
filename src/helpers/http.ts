export const sendJson = function (json) {
	return ContentService
	  	.createTextOutput(json)
	  	.setMimeType(ContentService.MimeType.JSON);
};