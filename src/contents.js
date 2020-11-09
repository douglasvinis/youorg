// -------------------------------------
//  @created: 2020-11-09
//  @author:  Douglas Vinicius
//  @email:   douglvini@gmail.com
// -------------------------------------

'use strict';

let video_entry_temp = document.getElementById("video_entry_temp").content;
let body = document.getElementsByTagName("body")[0];
for (let i=0; i < 20; i++)
{
	let video_entry = document.importNode(video_entry_temp, true);
	video_entry.querySelector("h3").innerText = "Video Title";
	body.appendChild(video_entry);
}
