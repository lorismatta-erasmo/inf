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
            // 1. CONNESSIONE AL TUO DATABASE "sito"
            $conn = new mysqli("localhost", "root", "", "sito");

            if ($conn->connect_error) {
                die("Connessione fallita: " . $conn->connect_error);
            }

            // 2. RECUPERO DATI DAL FORM
            $ricerca = isset($_POST['ricerca']) ? $_POST['ricerca'] : '';
            $genere = isset($_POST['genere']) ? $_POST['genere'] : '';
            $nome = isset($_POST['nome']) ? $_POST['nome'] : '';
            $cognome = isset($_POST['cognome']) ? $_POST['cognome'] : '';
            $email = isset($_POST['email']) ? $_POST['email'] : '';
            

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
                            <th>Nome</th>
                            <th>Cognome</th>
                            <th>Genere</th>
                            <th>Email</th>
                        </tr>
                      </thead>
                      <tbody>";

                while ($row = $result->fetch_assoc()) {
                    echo "<tr>
                            <td>" . $row["nome"] . "</td>
                            <td>" . $row["cognome"] . "</td>
                            <td>" . $row["genere"] . "</td>
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

        <div class="sezione-conteggio">
            <?php if (isset($_POST['mostra_conteggio'])): ?>
            <div id="conteggio-genere">
                <?php
                // Ricollegati al database per il conteggio
                $conn2 = new mysqli("localhost", "root", "", "sito");
                if ($conn2->connect_error) {
                    die("Connessione fallita: " . $conn2->connect_error);
                }

                // Query per conteggio per genere
                $sql_conteggio = "SELECT genere, COUNT(*) as numero FROM utenti GROUP BY genere";
                $result_conteggio = $conn2->query($sql_conteggio);

                if ($result_conteggio->num_rows > 0) {
                    echo "<h2>Conteggio per Genere</h2>";
                    echo "<table class='tabella-dati'>";
                    echo "<thead>
                            <tr>
                                <th>Genere</th>
                                <th>Numero</th>
                            </tr>
                          </thead>
                          <tbody>";

                    while ($row = $result_conteggio->fetch_assoc()) {
                        echo "<tr>
                                <td>" . $row["genere"] . "</td>
                                <td>" . $row["numero"] . "</td>
                              </tr>";
                    }

                    echo "</tbody></table>";
                }

                $conn2->close();
                ?>
            </div>
            <?php endif; ?>
        </div>

        <div class="sezione-link">
            <a href="visualizza-dati.html" class="btn-link">← Torna Indietro</a>
        </div>
    </div>

</body>
</html>
