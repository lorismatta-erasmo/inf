<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "sito";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Connessione fallita: " . $conn->connect_error);
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
$stmt->close();
$conn->close();
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualizza Dati Utenti</title>
    <link rel="stylesheet" href="style-form-box-model.css">
    <link rel="stylesheet" href="style-visualizza.css">
</head>
<body>
    <div class="contenitore-visualizza">
        <h1>Elenco Utenti Registrati</h1>
        
        <div class="sezione-filtri">
            <form method="GET" action="visualizza-dati.php" class="form-filtri">
                <div class="gruppo-filtro">
                    <label for="ricerca">Ricerca (nome, cognome o email):</label>
                    <input type="text" id="ricerca" name="ricerca" placeholder="Inserisci il nome o l'email..." value="<?php echo htmlspecialchars($ricerca); ?>">
                </div>

                <div class="gruppo-filtro">
                    <label for="genere">Filtro genere:</label>
                    <select id="genere" name="genere">
                        <option value="">-- Tutti --</option>
                        <option value="maschio" <?php echo $genere_filtro === 'maschio' ? 'selected' : ''; ?>>Maschio</option>
                        <option value="femmina" <?php echo $genere_filtro === 'femmina' ? 'selected' : ''; ?>>Femmina</option>
                    </select>
                </div>

                <button type="submit" class="btn-cerca">Cerca</button>
                <a href="visualizza-dati.php" class="btn-reset">Ripristina</a>
            </form>
        </div>

        <div class="sezione-risultati">
            <?php if (count($utenti) > 0): ?>
                <p class="contatore">Trovati <strong><?php echo count($utenti); ?></strong> risultati</p>
                
                <table class="tabella-utenti">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Cognome</th>
                            <th>Genere</th>
                            <th>Data Nascita</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($utenti as $utente): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($utente['id']); ?></td>
                                <td><?php echo htmlspecialchars($utente['nome']); ?></td>
                                <td><?php echo htmlspecialchars($utente['cognome']); ?></td>
                                <td><?php echo htmlspecialchars(ucfirst($utente['genere'])); ?></td>
                                <td><?php echo htmlspecialchars($utente['data_nascita']); ?></td>
                                <td><?php echo htmlspecialchars($utente['email']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <div class="messaggio-vuoto">
                    <p>Nessun utente trovato.</p>
                    <?php if (!empty($ricerca) || !empty($genere_filtro)): ?>
                        <p>Prova a modificare i filtri di ricerca.</p>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>

        <div class="sezione-link">
            <a href="index.html" class="btn-link">← Torna alla Registrazione</a>
        </div>
    </div>
<!-- Code injected by live-server -->
<script>
	// <![CDATA[  <-- For SVG support
	if ('WebSocket' in window) {
		(function () {
			function refreshCSS() {
				var sheets = [].slice.call(document.getElementsByTagName("link"));
				var head = document.getElementsByTagName("head")[0];
				for (var i = 0; i < sheets.length; ++i) {
					var elem = sheets[i];
					var parent = elem.parentElement || head;
					parent.removeChild(elem);
					var rel = elem.rel;
					if (elem.href && typeof rel != "string" || rel.length == 0 || rel.toLowerCase() == "stylesheet") {
						var url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, '');
						elem.href = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cacheOverride=' + (new Date().valueOf());
					}
					parent.appendChild(elem);
				}
			}
			var protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
			var address = protocol + window.location.host + window.location.pathname + '/ws';
			var socket = new WebSocket(address);
			socket.onmessage = function (msg) {
				if (msg.data == 'reload') window.location.reload();
				else if (msg.data == 'refreshcss') refreshCSS();
			};
			if (sessionStorage && !sessionStorage.getItem('IsThisFirstTime_Log_From_LiveServer')) {
				console.log('Live reload enabled.');
				sessionStorage.setItem('IsThisFirstTime_Log_From_LiveServer', true);
			}
		})();
	}
	else {
		console.error('Upgrade your browser. This Browser is NOT supported WebSocket for Live-Reloading.');
	}
	// ]]>
</script>
</body>
</html>
