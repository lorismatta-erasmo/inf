<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risultati Ricerca</title>
    <link rel="stylesheet" href="style-form-box-model.css">
    <link rel="stylesheet" href="style-visualizza.css">
</head>
<body>
    <div class="contenitore-visualizza">
        <h1>Risultati Ricerca</h1>
        
        <div class="sezione-risultati">
            <?php
            // 1. CONNESSIONE AL DATABASE "sito"
            $conn = new mysqli("localhost", "root", "", "sito");

            if ($conn->connect_error) {
                die("Connessione fallita: " . $conn->connect_error);
            }

            // 2. RECUPERO DATI DAL FORM
            // Nel HTML i campi si chiamano 'ricerca' e 'genere'
            $ricerca = isset($_POST['ricerca']) ? $_POST['ricerca'] : '';
            $genere = isset($_POST['genere']) ? $_POST['genere'] : '';

            // 3. COSTRUZIONE DELLA QUERY
            // Selezioniamo tutto dalla tabella "utenti"
            $sql = "SELECT * FROM utenti WHERE 1=1";

            // Se l'utente ha scritto qualcosa nel campo ricerca
            if (!empty($ricerca)) {
                $sql .= " AND (nome LIKE '%$ricerca%' OR cognome LIKE '%$ricerca%' OR email LIKE '%$ricerca%')";
            }

            // Se l'utente ha selezionato un genere
            if (!empty($genere)) {
                $sql .= " AND genere = '$genere'";
            }

            $result = $conn->query($sql);

            // 4. VISUALIZZAZIONE TABELLA
            if ($result->num_rows > 0) {
                // Uso la classe 'tabella-dati' del tuo file CSS invece dello style inline
                echo "<table class='tabella-dati'>";
                echo "<thead>
                        <tr>
                            <th>Nome</th>
                            <th>Cognome</th>
                            <th>Email</th>
                            <th>Genere</th>
                        </tr>
                      </thead>
                      <tbody>";

                while($row = $result->fetch_assoc()) {
                    echo "<tr>
                            <td>" . $row["nome"] . "</td>
                            <td>" . $row["cognome"] . "</td>
                            <td>" . $row["email"] . "</td>
                            <td>" . $row["genere"] . "</td>
                          </tr>";
                }

                echo "</tbody></table>";
            } else {
                echo "<div class='messaggio-vuoto'><p>Nessun risultato trovato.</p></div>";
            }

            $conn->close();
            ?>
        </div>

        <div class="sezione-link">
            <a href="visualizza-dati.html" class="btn-link">← Torna Indietro</a>
        </div>
    </div>
</body>
</html>