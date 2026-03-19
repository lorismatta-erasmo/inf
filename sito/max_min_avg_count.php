<?php
$conn = new mysqli("localhost", "root", "", "gestione_scuola");

if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
}

$sql = "SELECT a.nome, a.cognome, 
               AVG(v.voto) as media, 
               MAX(v.voto) as massimo, 
               MIN(v.voto) as minimo
        FROM alunni a
        JOIN voti v ON a.id_studente = v.id_studente
        GROUP BY a.id_studente, a.nome, a.cognome
        ORDER BY a.cognome, a.nome";

$result = $conn->query($sql);
$conn->close();
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>max min avg count Studenti</title>
    <link rel="stylesheet" href="style-form-box-model.css">
    <link rel="stylesheet" href="style-visualizza.css">
</head>
<body>
    <div class="contenitore-visualizza">
        <h1>Risultati Ricerca max min avg count</h1>
        
        <div class="sezione-risultati">

<?php
if ($result && $result->num_rows > 0) {

    echo "<table class='tabella-dati'>";
    echo "<thead>
            <tr>
                <th>Nome</th>
                <th>Cognome</th>
                <th>Media</th>
                <th>Voto Max</th>
                <th>Voto Min</th>
            </tr>
          </thead>";
    echo "<tbody>";

    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$row['nome']}</td>";
        echo "<td>{$row['cognome']}</td>";
        echo "<td>" . round($row['media'], 2) . "</td>";
        echo "<td>{$row['massimo']}</td>";
        echo "<td>{$row['minimo']}</td>";
        echo "</tr>";
    }

    echo "</table>";
} else {
    echo "Nessun risultato trovato.";
}
?>

</body>
</html>