window.addEventListener('DOMContentLoaded', () => {
	let banner = document.getElementsByClassName('board-banner')[0];
	
	if (banner) {
		banner.addEventListener('click', function() {
			// append some garbage so cache not used
			this.src = this.src + '&t=' + new Date().getTime();
		});
	}
});