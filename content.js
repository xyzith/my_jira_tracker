chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if(sender.id !== chrome.runtime.id) { return false; }
	const status_el = document.getElementById('status-val');
	const desc_el = document.querySelector('.user-content-block');
	if(!status_el || !desc_el) { return false; }
	switch(request.action) {
		case 'GET_TICKET_INFO':
			const status = status_el.textContent.trim();
			const desc = desc_el.textContent.trim();
			sendResponse({ status, desc });
		case 'IS_READY': 
			sendResponse(true);
	}
});
