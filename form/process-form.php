<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "sito";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

// Ricezione dati esattamente come arrivano dal form
$nome         = $_POST['nome'];
$cognome      = $_POST['cognome'];
$genere       = $_POST['genere'];
$data_nascita = $_POST['data-nascita']; 
$email        = $_POST['email'];
$password     = $_POST['password'];       // COLONNA DEL DB = password

// Query corretta per il tuo MySQL
$sql = "INSERT INTO utenti (nome, cognome, genere, data_nascita, email, password)
        VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssss", $nome, $cognome, $genere, $data_nascita, $email, $password);

if ($stmt->execute()) {
    echo "Registrazione completata con successo!";
} else {
    echo "Errore: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>

