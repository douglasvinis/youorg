// -------------------------------------
//  @created: 2020-11-11
//  @author:  Douglas Vinicius
//  @email:   douglvini@gmail.com
// -------------------------------------

'use strict';

// @todo make this execute not only when the entire page is loaded.
let channel_panel = document.getElementById("primary");
// channel_panel.style.border = "thick solid #ff0000";
let sub_channels = channel_panel.getElementsByTagName("ytd-channel-renderer");

for (let channel of sub_channels)
{
	let sub_button = channel.querySelector("#subscribe-button");
	let channel_link = channel.querySelector(".channel-link").getAttribute("href");
	let add_button = document.createElement("button");
	add_button.addEventListener("click", async (evt) =>
	{
		let message = channel_link.split("/")[2];
		browser.runtime.sendMessage({"text": message});
	});
	// add_button.setAttribute("id", "youorg_button");
	add_button.innerText = "ADD TO GROUP";
	add_button.style.color = "#000000";
	sub_button.appendChild(add_button);
}

console.log("__DONE__");
