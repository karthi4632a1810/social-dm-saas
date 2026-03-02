<?php
// PUBLIC CORS HEADERS — any website can call this
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read JSON input
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || !isset($data["question"])) {
    echo json_encode(["error" => "Invalid request"]);
    exit;
}

$API_KEY = getenv("GROQ_API_KEY") ?: "";  // Set via environment variable
$question = $data["question"];
$websiteData = $data["websiteData"];

// SYSTEM INSTRUCTION: restrict the bot
$system_instruction = "
You are the official AI assistant for my website.
Here is the complete website data in JSON:
$websiteData

Rules:
1. If the user says greetings (hi, hello, hey, vanakkam, namaste, etc.), reply: 
   'Hi! How can I help you with our Speed Hospital services?'

2. You must only answer using the Speed Hospital JSON data provided.

3. If the question is unrelated to Speed Hospital or not found in JSON, reply: 
   'Sorry, I can only assist with Speed Hospital related questions.'

You must ONLY answer using this data.
If the user asks anything not present in this data, reply:
'Sorry, I can only assist with questions related to our Speed Hospital.'
";

// Groq payload
$payload = [
    "model" => "openai/gpt-oss-20b",
    "messages" => [
        ["role" => "system", "content" => $system_instruction],
        ["role" => "user", "content" => $question]
    ],
    "temperature" => 1,
    "max_completion_tokens" => 8192,
    "top_p" => 1,
    "stream" => false,
    "reasoning_effort" => "medium",
    "stop" => null
];

$ch = curl_init("https://api.groq.com/openai/v1/chat/completions");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer $API_KEY"
    ],
    CURLOPT_POSTFIELDS => json_encode($payload)
]);

$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

// Return error or Groq response
echo $error ? json_encode(["error" => $error]) : $response;
