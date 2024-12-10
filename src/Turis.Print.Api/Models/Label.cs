using System;
using System.Collections.Generic;

namespace MiBox.Print.Api.Models
{
    public class Label
    {
        public string CartId { get; set; }
        public string CartBaseCode { get; set; }
        public int CartNumber { get; set; }
        public string CartNumberText { get; set; }
        public string ProcessCode { get; set; }
        public string ProcessName { get; set; }
        public string WotkstationCode { get; set; }
        public string WorkstationName { get; set; }
        public string WorkPhaseFlowType { get; set; }

        public string UserOpen { get; set; }
        public DateTime TimeStampeOpen { get; set; }
        public string UserClose { get; set; }
        public DateTime TimeStampeClose { get; set; }

        public string SerialId { get; set; }
        public string SerialCode { get; set; }
        public int ViewOrder { get; set; }
        public int Sequence { get; set; }
        public string SequenceText { get; set; }
        public DateTime DueDate { get; set; }
        public string DocumentBatch { get; set; }
        public string DocumentNumber { get; set; }

        public string CodeMaterial { get; set; }
        public string DesMaterial { get; set; }
        public string DrawCode { get; set; }
        public string DrawRevision { get; set; }
        public string CodeProgram { get; set; }
        public string Quantity { get; set; }
        public string CodeUnitMeasure { get; set; }
        public string CodeMaterialProductionOrder { get; set; }
        public string DesMaterialProductionOrder { get; set; }
        public string DrawCodeProductionOrder { get; set; }
        public string DrawRevisionProductionOrder { get; set; }
        public string QuantityProductionOrder { get; set; }
        public string CodeUnitMeasureProductionOrder { get; set; }

        public string ParentDocumentNumber { get; set; }
        public DateTime ParentDueDate { get; set; }
        public int ParentSequence { get; set; }
        public string ParentSequenceText { get; set; }
        public string ParentSequenceOldText { get; set; }
        public string ParentCodeMaterial { get; set; }
        public string ParentDesMaterial { get; set; }
        public string ParentBatch { get; set; }
        public string ParentCustomer { get; set; }

        public List<Coprodotto> Coprodotti { get; set; }
    }

    public class Coprodotto
    {
        public string SerialId { get; set; }
        public string CodeMaterial { get; set; }
        public string DesMaterial { get; set; }
    }
}