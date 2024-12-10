using System;

namespace MiBox.Print.Api.Models
{
    public class LabelPrint
    {
        public LabelPrint()
        {

        }

        public LabelPrint(Label label, Coprodotto coprodotto = null)
        {
            CartId = label.CartId;
            CartBaseCode = label.CartBaseCode;
            CartNumber = label.CartNumber;
            CartNumberText = label.CartNumberText;
            ProcessCode = label.ProcessCode;
            ProcessName = label.ProcessName;
            WotkstationCode = label.WotkstationCode;
            WorkstationName = label.WorkstationName;
            WorkPhaseFlowType = label.WorkPhaseFlowType;

            UserOpen = label.UserOpen;
            TimeStampeOpen = label.TimeStampeOpen;
            UserClose = label.UserClose;
            TimeStampeClose = label.TimeStampeClose;

            SerialId = label.SerialId;
            SerialCode = label.SerialCode;
            ViewOrder = label.ViewOrder;
            Sequence = label.Sequence;
            SequenceText = label.SequenceText;
            DueDate = label.DueDate;
            DocumentBatch = label.DocumentBatch;
            DocumentNumber = label.DocumentNumber;

            CodeMaterial = label.CodeMaterial;
            DesMaterial = label.DesMaterial;
            DrawCode = label.DrawCode;
            DrawRevision = label.DrawRevision;
            CodeProgram = label.CodeProgram;
            Quantity = label.Quantity;
            CodeUnitMeasure = label.CodeUnitMeasure;
            CodeMaterialProductionOrder = label.CodeMaterialProductionOrder;
            DesMaterialProductionOrder = label.DesMaterialProductionOrder;
            DrawCodeProductionOrder = label.DrawCodeProductionOrder;
            DrawRevisionProductionOrder = label.DrawRevisionProductionOrder;
            QuantityProductionOrder = label.QuantityProductionOrder;
            CodeUnitMeasureProductionOrder = label.CodeUnitMeasureProductionOrder;

            ParentDocumentNumber = label.ParentDocumentNumber;
            ParentDueDate = label.ParentDueDate;
            ParentSequence = label.ParentSequence;
            ParentSequenceText = label.ParentSequenceText;
            ParentSequenceOldText = label.ParentSequenceOldText;
            ParentCodeMaterial = label.ParentCodeMaterial;
            ParentDesMaterial = label.ParentDesMaterial;
            ParentBatch = label.ParentBatch;
            ParentCustomer = label.ParentCustomer;

            if (coprodotto != null)
            {
                Coprodotto = true;
                CoprodottoCodeMaterial = coprodotto.CodeMaterial;
                CoprodottoDesMaterial = coprodotto.DesMaterial;
            }
        }

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

        public bool Coprodotto { get; set; }
        public string CoprodottoCodeMaterial { get; set; }
        public string CoprodottoDesMaterial { get; set; }
    }
}