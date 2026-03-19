<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Registrazione Utente</title>
    <link rel="stylesheet" href="style-form-box-model.css">
</head>
<body>
<?php
if (isset($_POST['invia'])) {

    $host = "localhost";
    $user = "root";
    $password_db = "";
    $database = "sito";

    $conn = new mysqli($host, $user, $password_db, $database);

    if ($conn->connect_error) {
        die("Connessione fallita: " . $conn->connect_error);
    }

    $nome         = $_POST['nome'];
    $cognome      = $_POST['cognome'];
    $genere       = $_POST['genere'];
    $data_nascita = $_POST['data-nascita'];
    $email        = $_POST['email'];
    $password     = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO utenti (nome, cognome, genere, data_nascita, email, password)
            VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssss", $nome, $cognome, $genere, $data_nascita, $email, $password);

    if ($stmt->execute()) {
        echo "<p>Registrazione completata con successo!</p>";
    } else {
        echo "<p>Errore: " . $stmt->error . "</p>";
    }

    $stmt->close();
    $conn->close();
} else {
?>
    
    <!-- se invia non è stato avvalorato allora mostra il form -->

    <div class="contenitore-form">
        <h1>Registrazione Utente</h1>
        
        <form method="POST" action="">
            <div class="gruppo-form">
                <label>Nome</label>
                <input type="text" name="nome" required>
            </div>

            <div class="gruppo-form">
                <label>Cognome</label>
                <input type="text" name="cognome" required>
            </div>

            <div class="gruppo-form">
                <label>Genere:</label>
                <input type="radio" name="genere" value="maschio" required> Maschio
                <input type="radio" name="genere" value="femmina" required> Femmina
            </div>

            <div class="gruppo-form">
                <label>Data di nascita</label>
                <input type="date" name="data-nascita" required>
            </div>

            <div class="gruppo-form">
                <label>Email</label>
                <input type="email" name="email" required>
            </div>

            <div class="gruppo-form">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>

            <button type="submit" name="invia">Invia</button>
        </form>
    </div>

<?php
}
?>
</body>
</html>
