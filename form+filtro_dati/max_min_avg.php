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
        <h1>Risultati Ricerca max min avg count</h1>
        
        <div class="sezione-risultati">
            <?php
            // 1. CONNESSIONE AL TUO DATABASE "sito"
            $conn = new mysqli("localhost", "root", "", "gestione_scuola");

            if ($conn->connect_error) {
                die("Connessione fallita: " . $conn->connect_error);
            }

            // 2. RECUPERO DATI DAL FORM
            $voto = isset($_POST['voto']) ? $_POST['voto'] : '';
            $cognome = isset($_POST['cognome']) ? $_POST['cognome'] : '';            

            // 3. COSTRUZIONE DELLA QUERY
            // Selezioniamo tutto dalla tabella "utenti"
            $sql = "SELECT * FROM utenti WHERE 1=1";
            // Query per conteggio per voto
                $sql_conteggio = "SELECT voto, COUNT(*) as numero FROM utenti GROUP BY voto";
                $result_conteggio = $conn->query($sql_conteggio);
            

            $result = $conn->query($sql);

            if (!$result) {
                echo "Errore nella query: " . $conn->error;
                exit;
            }

            // 4. VISUALIZZAZIONE TABELLA
            if ($result->num_rows > 0) {
                // Uso la classe 'tabella-dati' del tuo file CSS invece dello style inline
                echo "<table class='tabella-dati'>";
                echo "<thead>
                        <tr>
                            <th>Cognome</th>
                            <th>voto massimo</th>
                            <th>voto minimo</th>
                            <th>media voti</th>
                            <th>numero voti</th>
                        </tr>
                      </thead>
                      <tbody>";

                while ($row = $result->fetch_assoc()) {
                    echo "<tr>
                            <td>" . $row["nome"] . "</td>
                            <td>" . $row["cognome"] . "</td>
                            <td>" . $row["genere"] . "</td>
                            <td>" . $row["email"] . "</td>
                            <td>" . $row["email"] . "</td>
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
