import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera e scarica il PDF del piano nutrizionale completo.
 * @param {Object} diet - L'oggetto dieta radice contenente dailyPlans, pasti e mealItems
 * @param {Array} foodsList - Il catalogo completo degli alimenti
 */
export const generateDietPdf = (diet, foodsList = []) => {
  const doc = new jsPDF();

  const getFoodDetails = (foodId) => {
    return foodsList.find(f => f.id === Number(foodId)) || { 
      nome: 'Alimento personalizzato', 
      calorie: 0, 
      proteine: 0, 
      carboidrati: 0, 
      grassi: 0 
    };
  };

  // --- INTESTAZIONE DEL DOCUMENTO ---
  doc.setFontSize(22);
  doc.setTextColor(33, 37, 41);
  doc.text(diet.titolo || 'Piano Nutrizionale Personalizzato', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  if (diet.note) {
    doc.text(`Note per il paziente: ${diet.note}`, 14, 28);
  }

  let startY = diet.note ? 36 : 28;

  // --- TARGET NUTRIZIONALI GENERALI ---
  doc.setFontSize(11);
  doc.setTextColor(13, 110, 253);
  doc.text(
    `Target Giornalieri -> Calorie: ${diet.calorieTarget || 0} kcal | Proteine: ${diet.proteineTarget || 0}g | Carboidrati: ${diet.carboidratiTarget || 0}g | Grassi: ${diet.grassiTarget || 0}g`, 
    14, 
    startY
  );
  
  startY += 10;

  // --- ITERAZIONE SULLA GERARCHIA (Giorni -> Pasti -> Alimenti) ---
  if (diet.dailyPlans && diet.dailyPlans.length > 0) {
    diet.dailyPlans.forEach((day) => {
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text(day.nomeGiorno || 'Giorno', 14, startY);
      startY += 6;

      if (day.meals && day.meals.length > 0) {
        day.meals.forEach((meal) => {
          if (startY > 260) {
            doc.addPage();
            startY = 20;
          }

          const tableRows = [];

          if (meal.mealItems && meal.mealItems.length > 0) {
            meal.mealItems.forEach((item) => {
              const foodObj = (typeof item.food === 'object' && item.food !== null)
                ? item.food 
                : getFoodDetails(item.foodId);

              const grammi = Number(item.grammi) || 0;
              const ratio = grammi / 100;

              const calorie = Math.round((foodObj.calorie || 0) * ratio);
              const proteine = Math.round(((foodObj.proteine || 0) * ratio) * 10) / 10;
              const carboidrati = Math.round(((foodObj.carboidrati || 0) * ratio) * 10) / 10;
              const grassi = Math.round(((foodObj.grassi || 0) * ratio) * 10) / 10;

              tableRows.push([
                foodObj.nome || 'Alimento',
                `${grammi} g`,
                `${calorie} kcal`,
                `P: ${proteine}g | C: ${carboidrati}g | G: ${grassi}g`
              ]);
            });
          } else {
            tableRows.push(['Nessun alimento inserito in questo pasto', '-', '-', '-']);
          }

          // Utilizzo della funzione autoTable importata direttamente
          autoTable(doc, {
            startY: startY,
            head: [[
              { 
                content: `🍽️ ${meal.nome}`, 
                colSpan: 4, 
                styles: { fillColor: [248, 249, 250], textColor: [13, 110, 253], fontStyle: 'bold', fontSize: 10 } 
              }
            ]],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [13, 110, 253] },
            styles: { fontSize: 8.5, cellPadding: 2.5 },
            columnStyles: {
              0: { cellWidth: 'auto' },
              1: { cellWidth: 25, halign: 'center' },
              2: { cellWidth: 25, halign: 'center' },
              3: { cellWidth: 60, halign: 'right' }
            },
            margin: { left: 14, right: 14 }
          });

          startY = doc.lastAutoTable.finalY + 6;
        });
      }
      startY += 8;
    });
  }

  const fileName = diet.titolo ? `${diet.titolo.toLowerCase().replace(/\s+/g, '_')}.pdf` : 'piano_nutrizionale.pdf';
  doc.save(fileName);
};