const GH = "https://api.github.com";
const user = "vortami";

/**
 *
 * @param {!string} type
 * @param {HTMLElement} [parent]
 * @param {string[]} [classes]
 * @param {string|HTMLElement} [inner]
 * @param {{}} [attributes]
 * @returns {HTMLElement}
 */
function element(type, parent, classes = [], inner, attributes = {}) {
	let e = document.createElement(type ?? "div");

	if (parent && parent instanceof HTMLElement) parent.appendChild(e);

	if (classes && classes.length > 0) e.classList.add(...classes);

	if (inner instanceof HTMLElement) e.appendChild(inner);
	else if (inner) e.innerHTML = inner;

	for (let attr of Object.keys(attributes)) {
		e[attr] = attributes[attr];
	}

	return e;
}

Promise.all([
	fetch(`${GH}/users/${user}`)
		.then(d => d.json())
		.then(data => {
			if (data.blog) {
				document.querySelector("header a").textContent = new URL(data.blog).hostname;
				document.querySelector("header a").href = data.blog;
			} else {
				document.querySelector("header a").remove();
			}

			let updatedBio = data.bio ?? "";
			updatedBio = updatedBio.replace(/\@([A-z0-9]+)\b/ig, "<a href=\"https://github.com/$1\">@$1</a>");

			document.querySelector("header img").src = data.avatar_url;
			document.querySelector("header h1").textContent = data.name;
			document.querySelector("header p").innerHTML = updatedBio;
		}),
	fetch(`${GH}/users/${user}/repos`)
		.then(d => d.json())
		.then(data => {
			document.querySelector("#repo-count").textContent = String(data.length);
			for (let repo of data) {
				let e = element("div", document.querySelector("#repos"));
				element("h3", e, null, repo.name);
				if (repo.description) element("div", e, null, repo.description);
				if (repo.homepage) element("a", e, ["link"], new URL(repo.homepage).hostname, { href: repo.homepage });
				element("div", e, null, `Last updated: ${new Date(repo.updated_at).toLocaleDateString()}`);
				element("a", e, ["link"], "View on GitHub", { href: repo.html_url });
			}
		}),
	fetch("./websites.json")
		.then(d => d.json())
		.then(data => {
			for (let website of data) {
				let url = new URL(website.href);
				let e = element("a", document.querySelector("#websites"), null, null, { href: website.href });
				element("img", e, null, null, { src: website.icon });
				if (website.title) element("h3", e, null, website.title);
				element(website.title && "div" || "h3", e, null, url.hostname + (url.pathname !== "/" ? url.pathname : ""));
			}
		})
]);
