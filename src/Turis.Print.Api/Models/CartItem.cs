using System;

namespace MiBox.Print.Api.Models
{
    public class CartItem
    {
        public string Id { get; set; }
        public string SerialCode { get; set; }
        public string CartId { get; set; }
        public int CartNumber { get; set; }
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
        public string OriginalProductionOrder { get; set; }
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


        public string WorkingCode
        {
            get { return $"{CartNumber.ToString().PadLeft(9, '0')}{ViewOrder.ToString().PadLeft(3, '0')}{SerialCode}"; }
        }
    }
}