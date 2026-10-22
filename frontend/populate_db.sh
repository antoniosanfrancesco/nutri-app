#!/bin/bash

BASE_URL="https://nutri-app-ecuw.onrender.com/api"
TOKEN="eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtYXJpb3Jvc3NpQGdtYWlsLmNvbSIsInJvbGUiOiJST0xFX05VVFJJVElPTklTVCIsImlhdCI6MTc5MjY4MTQzNywiZXhwIjoxNzkyNzY3ODM3fQ.mHHhsmverUNTe5lfgrpQd3EsBgvU9_hHOHZ8doOgy1llLFlWYw9I6a4_wtWYSwNC"

echo "🚀 Inizio popolamento completo con storico misurazioni (Miglioramenti e Peggioramenti)..."

create_complete_patient_data() {
  local NOME=$1
  local COGNOME=$2
  local CF=$3
  local EMAIL=$4
  local TEL=$5
  local DATA_NAS=$6
  local SESSO=$7
  local ALTEZZA=$8
  local DIETA1_TITLE=$9
  local DIETA1_NOTE=${10}
  local DIETA1_CAL=${11}
  local DIETA2_TITLE=${12}
  local DIETA2_NOTE=${13}
  local DIETA2_CAL=${14}
  
  # Misurazione 1 (Iniziale - Settembre)
  local M1_DATA=${15}
  local M1_PESO=${16}
  local M1_GRASSA=${17}
  local M1_MAGRA=${18}
  local M1_VITA=${19}
  local M1_FIANCHI=${20}
  local M1_BRACCIO=${21}
  local M1_COSCIA=${22}
  local M1_NOTE=${23}

  # Misurazione 2 (Recente - Ottobre)
  local M2_DATA=${24}
  local M2_PESO=${25}
  local M2_GRASSA=${26}
  local M2_MAGRA=${27}
  local M2_VITA=${28}
  local M2_FIANCHI=${29}
  local M2_BRACCIO=${30}
  local M2_COSCIA=${31}
  local M2_NOTE=${32}

  echo "👤 Elaborazione paziente: $NOME $COGNOME..."

  # 1. Creazione Paziente (assegniamo il peso dell'ultima rilevazione)
  RESPONSE=$(curl -s -X POST "$BASE_URL/patients" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"nome\": \"$NOME\",
      \"cognome\": \"$COGNOME\",
      \"codiceFiscale\": \"$CF\",
      \"email\": \"$EMAIL\",
      \"telefono\": \"$TEL\",
      \"dataNascita\": \"$DATA_NAS\",
      \"sesso\": \"$SESSO\",
      \"peso\": $M2_PESO,
      \"altezza\": $ALTEZZA
    }")

  PATIENT_ID=$(echo $RESPONSE | grep -o '"id":[^,}]*' | head -n 1 | sed 's/"id"://;s/"//g;s/ //g')

  if [ -z "$PATIENT_ID" ] || [ "$PATIENT_ID" = "null" ]; then
    echo "❌ Errore durante la creazione del paziente $NOME $COGNOME. Risposta: $RESPONSE"
    return
  fi

  echo "   └─ ID Paziente: $PATIENT_ID"

  # 2. Creazione Dieta 1
  curl -s -X POST "$BASE_URL/diets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"titolo\": \"$DIETA1_TITLE\",
      \"note\": \"$DIETA1_NOTE\",
      \"patientId\": $PATIENT_ID,
      \"calorieTarget\": $DIETA1_CAL,
      \"proteineTarget\": 140,
      \"carboidratiTarget\": 200,
      \"grassiTarget\": 60,
      \"dailyPlans\": []
    }" > /dev/null

  # 3. Creazione Dieta 2
  curl -s -X POST "$BASE_URL/diets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"titolo\": \"$DIETA2_TITLE\",
      \"note\": \"$DIETA2_NOTE\",
      \"patientId\": $PATIENT_ID,
      \"calorieTarget\": $DIETA2_CAL,
      \"proteineTarget\": 120,
      \"carboidratiTarget\": 180,
      \"grassiTarget\": 55,
      \"dailyPlans\": []
    }" > /dev/null

  # 4. Inserimento Misurazione 1 (Iniziale)
  curl -s -X POST "$BASE_URL/measurements" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"patientId\": $PATIENT_ID,
      \"dataMisurazione\": \"$M1_DATA\",
      \"peso\": $M1_PESO,
      \"altezza\": $ALTEZZA,
      \"massaGrassa\": $M1_GRASSA,
      \"massaMagra\": $M1_MAGRA,
      \"circonferenzaVita\": $M1_VITA,
      \"circonferenzaFianchi\": $M1_FIANCHI,
      \"circonferenzaBraccio\": $M1_BRACCIO,
      \"circonferenzaCoscia\": $M1_COSCIA,
      \"note\": \"$M1_NOTE\"
    }" > /dev/null

  # 5. Inserimento Misurazione 2 (Recente)
  curl -s -X POST "$BASE_URL/measurements" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"patientId\": $PATIENT_ID,
      \"dataMisurazione\": \"$M2_DATA\",
      \"peso\": $M2_PESO,
      \"altezza\": $ALTEZZA,
      \"massaGrassa\": $M2_GRASSA,
      \"massaMagra\": $M2_MAGRA,
      \"circonferenzaVita\": $M2_VITA,
      \"circonferenzaFianchi\": $M2_FIANCHI,
      \"circonferenzaBraccio\": $M2_BRACCIO,
      \"circonferenzaCoscia\": $M2_COSCIA,
      \"note\": \"$M2_NOTE\"
    }" > /dev/null

  echo "   └─ Diete e storico misurazioni registrati con successo!"
}

# --- INSERIMENTO 10 PAZIENTI CON TREND MISTI (Miglioramenti e Peggioramenti) ---

# 1. Mario Rossi (Miglioramento: calo di peso e massa grassa)
create_complete_patient_data "Mario" "Rossi" "RSSMRA85M01H501Z" "mario.rossi.test@example.com" "3331112233" "1985-05-12" "M" 178 "Dieta Definizione" "Ridurre carbo la sera" 2100 "Dieta Mantenimento" "Acqua 2.5L" 2500 \
  "2026-09-01" 85.0 20.0 80.0 92.0 100.0 32.0 57.0 "Prima visita, motivato." \
  "2026-10-19" 82.5 18.5 81.5 88.0 98.0 32.0 56.0 "Ottimi progressi, calo ponderale evidente."

# 2. Giulia Bianchi (Miglioramento: ricomposizione corporea)
create_complete_patient_data "Giulia" "Bianchi" "BNCGLI90A41F205K" "giulia.bianchi.test@example.com" "3382223344" "1990-01-25" "F" 165 "Dieta Mediterranea" "Verdure di stagione" 1500 "Dieta Anti-Gonfiore" "No latticini" 1600 \
  "2026-09-03" 62.0 23.5 77.0 73.0 96.0 27.0 52.0 "Segnalato gonfiore." \
  "2026-10-19" 61.0 22.0 78.0 70.0 94.0 27.0 51.0 "Gonfiore ridotto, tonicità migliorata."

# 3. Luca Verdi (Stabile / Ottimizzazione)
create_complete_patient_data "Luca" "Verdi" "VRDLCU88P15F205Y" "luca.verdi.test@example.com" "3473334455" "1988-09-15" "M" 172 "Dieta Enduro" "Carbo load" 2800 "Dieta Riposo" "Ridurre glucidi" 2200 \
  "2026-09-05" 74.5 15.0 84.5 81.0 93.0 33.0 55.0 "Atleta in preparazione." \
  "2026-10-19" 75.0 14.5 85.5 80.0 92.0 33.0 55.0 "Leggero aumento muscolare pulito."

# 4. Martina Neri (Peggioramento: aumento di peso e grasso)
create_complete_patient_data "Martina" "Neri" "NRNMTN95C41Z100X" "martina.neri.test@example.com" "3204445566" "1995-03-01" "F" 160 "Dieta Vegetariana" "Legumi frequenti" 1700 "Dieta Detox" "Depurativa" 1400 \
  "2026-09-02" 53.0 19.0 81.0 63.0 88.0 25.0 47.0 "Situazione iniziale buona." \
  "2026-10-19" 54.5 20.5 79.5 65.0 89.0 25.0 48.0 "Peggioramento dovuto a sgarri alimentari."

# 5. Alessandro Colombo (Miglioramento moderato)
create_complete_patient_data "Alessandro" "Colombo" "CLBLSN78T10F205W" "alessandro.colombo.test@example.com" "3355556677" "1978-12-10" "M" 181 "Dieta Colesterolo" "Olio EVO" 2200 "Dieta Iposodica" "Poco sale" 2100 \
  "2026-09-04" 90.5 25.5 75.0 102.0 106.0 34.0 61.0 "Valori lipidici alterati." \
  "2026-10-19" 88.0 24.0 76.0 98.0 104.0 34.0 60.0 "Parametri in miglioramento."

# 6. Sara Romano (Peggioramento: accumulo adiposo e ritenzione)
create_complete_patient_data "Sara" "Romano" "RMNSRA92D48H501U" "sara.romano.test@example.com" "3496667788" "1992-04-08" "F" 168 "Dieta Tiroide" "Evitare goitrogeni" 1650 "Dieta Tonificazione" "3 workout/settimana" 1900 \
  "2026-09-06" 65.0 22.0 78.0 72.0 97.0 28.0 52.0 "Stress lavorativo elevato." \
  "2026-10-19" 66.0 23.5 76.5 74.0 99.0 28.0 53.0 "Peggioramento della circonferenza vita."

# 7. Davide Ferrari (Peggioramento netto: non ha seguito la dieta)
create_complete_patient_data "Davide" "Ferrari" "FRRDVD83H22F205S" "davide.ferrari.test@example.com" "3407778899" "1983-06-22" "M" 175 "Dieta Ipocalorica" "Fase urto" 1800 "Dieta Ricalo" "Transizione" 2200 \
  "2026-09-01" 87.0 25.0 75.0 98.0 103.0 35.0 63.0 "Richiesta perdita peso urgente." \
  "2026-10-19" 90.5 27.0 73.0 102.0 106.0 35.0 62.0 "Peggioramento significativo, scarsa adesione al piano."

# 8. Elena Gialli (Miglioramento costante)
create_complete_patient_data "Elena" "Gialli" "GLLLNE98R52F205Q" "elena.gialli.test@example.com" "3288889900" "1998-10-12" "F" 170 "Dieta Universitaria" "Pasti veloci" 1750 "Dieta Runner" "Carbo pre-corsa" 2000 \
  "2026-09-08" 59.5 20.5 79.5 70.0 93.0 26.0 51.0 "Inizio protocollo." \
  "2026-10-19" 58.0 19.0 81.0 68.0 91.0 26.0 50.0 "Ottima perdita di grasso corporeo."

# 9. Marco Esposito (Miglioramento: aumento massa muscolare pulita)
create_complete_patient_data "Marco" "Esposito" "SPSMRC81L05F839J" "marco.esposito.test@example.com" "3391234567" "1981-07-05" "M" 177 "Dieta Proteica" "Low glycemic" 2300 "Dieta Rebound" "Aumento progressivo" 2700 \
  "2026-09-02" 79.5 16.5 83.5 86.0 95.0 33.0 56.0 "Fase di massa." \
  "2026-10-19" 81.0 16.0 84.0 85.0 96.0 33.5 57.0 "Aumento di peso dovuto a massa magra."

# 10. Francesca Moretti (Leggero peggioramento / stallo)
create_complete_patient_data "Francesca" "Moretti" "MRTFNC87S61H501D" "francesca.moretti.test@example.com" "3489876543" "1987-11-21" "F" 164 "Dieta Benessere" "Antiossidanti" 1600 "Dieta Low Carb" "Carbo ridotti sera" 1500 \
  "2026-09-10" 62.0 20.0 80.0 70.0 94.0 27.5 52.0 "Controllo di routine." \
  "2026-10-19" 63.0 21.0 79.0 72.0 95.0 27.5 52.0 "Leggero incremento ponderale."

echo "🎉 Popolamento con storico e trend misti completato con successo!"
