import { select } from "@inquirer/prompts";

const isDev = process.env.NODE_ENV !== "production";
const baseURL = isDev ? "http://localhost:5175" : "https://iframe.payconductor.ai";

const VERSIONS = ["v1"];
type Version = (typeof VERSIONS)[number];

async function download(url: string, dest: string) {
	const res = await fetch(url);
	if (!res.ok) {
		console.error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
		process.exit(1);
	}
	const text = await res.text();
	await Bun.write(dest, text);
	console.log(`  ✓ ${url} → ${dest}`);
}

async function run() {
	const version = await select<Version>({
		message: "Select SDK version to sync",
		choices: VERSIONS.map((v) => ({ name: v, value: v })),
		default: "v1",
	});

	const destPath = `library/${version}/src/payconductor/iframe`;

	console.log(`Syncing types and constants from ${baseURL} to ${destPath}...`);

	await download(`${baseURL}/shared/types.ts`, `${destPath}/types.ts`);
	await download(`${baseURL}/shared/constants.ts`, `${destPath}/constants.ts`);

	console.log("Sync completed successfully.");
}

run();
