<?php
header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$password = "";
$database = "sito";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'messaggio' => 'Connessione fallita: ' . $conn->connect_error
    ]);
    exit;
}

// Variabili di ricerca/filtro
$ricerca = isset($_GET['ricerca']) ? trim($_GET['ricerca']) : '';
$genere_filtro = isset($_GET['genere']) ? $_GET['genere'] : '';

// Costruzione della query con filtri
$sql = "SELECT id, nome, cognome, genere, data_nascita, email FROM utenti WHERE 1=1";
$params = [];
$types = '';

// Filtro ricerca (nome, cognome o email)
if (!empty($ricerca)) {
    $sql .= " AND (nome LIKE ? OR cognome LIKE ? OR email LIKE ?)";
    $search_term = "%$ricerca%";
    array_push($params, $search_term, $search_term, $search_term);
    $types .= 'sss';
}

// Filtro genere
if (!empty($genere_filtro)) {
    $sql .= " AND genere = ?";
    array_push($params, $genere_filtro);
    $types .= 's';
}

$sql .= " ORDER BY cognome, nome";

$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();
$utenti = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    'success' => true,
    'utenti' => $utenti
]);

$stmt->close();
$conn->close();
?>
