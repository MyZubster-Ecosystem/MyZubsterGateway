const repository = "MyZubster-Ecosystem/MyZubsterGateway";
const issueNumbers = [
  255, 257, 259, 261, 268, 271, 274,
  276, 277, 278, 279, 280, 281, 282, 283, 284,
  338, 339, 344, 345, 347, 358,
  360, 361, 362, 363, 364, 365, 366, 367,
  371, 372, 373, 374, 375, 376, 377, 389,
];

const automaticPaymentPattern =
  /(?:pagamento|payment).{0,80}(?:dopo|after).{0,30}(?:merge|merged)/is;
const clarificationPattern =
  /(?:does.{0,12}not|non).{0,140}(?:proof|prove|prova).{0,140}(?:payment|pagamento|settlement|settled|funding|funded)/is;

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "myzubster-legacy-bounty-audit",
  "X-GitHub-Api-Version": "2022-11-28",
};

if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

async function inspectIssue(number) {
  const response = await fetch(`https://api.github.com/repos/${repository}/issues/${number}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`#${number}: GitHub API returned ${response.status}`);
  }

  const issue = await response.json();
  const body = issue.body ?? "";

  return {
    issue: number,
    state: issue.state,
    automaticPaymentWording: automaticPaymentPattern.test(body),
    settlementClarification: clarificationPattern.test(body),
  };
}

const results = [];
for (const number of issueNumbers) {
  results.push(await inspectIssue(number));
}

for (const result of results) {
  const status = result.settlementClarification
    ? "clarification-present"
    : result.automaticPaymentWording
      ? "legacy-wording"
      : "manual-review";
  console.log(`#${result.issue}\t${result.state}\t${status}`);
}

const legacyCount = results.filter(
  (result) => result.automaticPaymentWording && !result.settlementClarification,
).length;
console.log(`inspected=${results.length} legacy=${legacyCount}`);
