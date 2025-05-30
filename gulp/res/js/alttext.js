/* globals __ */

function initAltToggle(container = document) {
	const altToggleLinks = container.querySelectorAll('.alt-toggle');

	altToggleLinks.forEach(link => {
		const hash = link.dataset.hash;
		const targetId = `alt-text-${hash}`;
		const target = container.querySelector(`#${targetId}`);

		if (!target) {
			return;
		}

		link.addEventListener('click', (e) => {
			e.preventDefault();
			target.hidden = !target.hidden;
			link.textContent = target.hidden ? __('Alt') : __('Hide Alt');
		});
	});
}

document.addEventListener('DOMContentLoaded', () => {
	initAltToggle();
});

// For dynamically added posts
window.addEventListener('addPost', (e) => {
	if (!e.detail?.post) {
		return;
	}
	initAltToggle(e.detail.post);
});
window.addEventListener('approvePost', (e) => {
	if (!e.detail?.post) {
		return;
	}
	initAltToggle(e.detail.post);
});

