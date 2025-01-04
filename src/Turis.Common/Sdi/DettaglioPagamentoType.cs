using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DettaglioPagamentoType {
    
        private string beneficiarioField;
    
        private ModalitaPagamentoType modalitaPagamentoField;
    
        private System.DateTime dataRiferimentoTerminiPagamentoField;
    
        private bool dataRiferimentoTerminiPagamentoFieldSpecified;
    
        private string giorniTerminiPagamentoField;
    
        private System.DateTime dataScadenzaPagamentoField;
    
        private bool dataScadenzaPagamentoFieldSpecified;
    
        private decimal importoPagamentoField;
    
        private string codUfficioPostaleField;
    
        private string cognomeQuietanzanteField;
    
        private string nomeQuietanzanteField;
    
        private string cFQuietanzanteField;
    
        private string titoloQuietanzanteField;
    
        private string istitutoFinanziarioField;
    
        private string iBANField;
    
        private string aBIField;
    
        private string cABField;
    
        private string bICField;
    
        private decimal scontoPagamentoAnticipatoField;
    
        private bool scontoPagamentoAnticipatoFieldSpecified;
    
        private System.DateTime dataLimitePagamentoAnticipatoField;
    
        private bool dataLimitePagamentoAnticipatoFieldSpecified;
    
        private decimal penalitaPagamentiRitardatiField;
    
        private bool penalitaPagamentiRitardatiFieldSpecified;
    
        private System.DateTime dataDecorrenzaPenaleField;
    
        private bool dataDecorrenzaPenaleFieldSpecified;
    
        private string codicePagamentoField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string Beneficiario {
            get {
                return this.beneficiarioField;
            }
            set {
                this.beneficiarioField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public ModalitaPagamentoType ModalitaPagamento {
            get {
                return this.modalitaPagamentoField;
            }
            set {
                this.modalitaPagamentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="date")]
        public System.DateTime DataRiferimentoTerminiPagamento {
            get {
                return this.dataRiferimentoTerminiPagamentoField;
            }
            set {
                this.dataRiferimentoTerminiPagamentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataRiferimentoTerminiPagamentoSpecified {
            get {
                return this.dataRiferimentoTerminiPagamentoFieldSpecified;
            }
            set {
                this.dataRiferimentoTerminiPagamentoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="integer")]
        public string GiorniTerminiPagamento {
            get {
                return this.giorniTerminiPagamentoField;
            }
            set {
                this.giorniTerminiPagamentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="date")]
        public System.DateTime DataScadenzaPagamento {
            get {
                return this.dataScadenzaPagamentoField;
            }
            set {
                this.dataScadenzaPagamentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataScadenzaPagamentoSpecified {
            get {
                return this.dataScadenzaPagamentoFieldSpecified;
            }
            set {
                this.dataScadenzaPagamentoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal ImportoPagamento {
            get {
                return this.importoPagamentoField;
            }
            set {
                this.importoPagamentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string CodUfficioPostale {
            get {
                return this.codUfficioPostaleField;
            }
            set {
                this.codUfficioPostaleField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string CognomeQuietanzante {
            get {
                return this.cognomeQuietanzanteField;
            }
            set {
                this.cognomeQuietanzanteField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string NomeQuietanzante {
            get {
                return this.nomeQuietanzanteField;
            }
            set {
                this.nomeQuietanzanteField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string CFQuietanzante {
            get {
                return this.cFQuietanzanteField;
            }
            set {
                this.cFQuietanzanteField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string TitoloQuietanzante {
            get {
                return this.titoloQuietanzanteField;
            }
            set {
                this.titoloQuietanzanteField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string IstitutoFinanziario {
            get {
                return this.istitutoFinanziarioField;
            }
            set {
                this.istitutoFinanziarioField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string IBAN {
            get {
                return this.iBANField;
            }
            set {
                this.iBANField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string ABI {
            get {
                return this.aBIField;
            }
            set {
                this.aBIField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string CAB {
            get {
                return this.cABField;
            }
            set {
                this.cABField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string BIC {
            get {
                return this.bICField;
            }
            set {
                this.bICField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal ScontoPagamentoAnticipato {
            get {
                return this.scontoPagamentoAnticipatoField;
            }
            set {
                this.scontoPagamentoAnticipatoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool ScontoPagamentoAnticipatoSpecified {
            get {
                return this.scontoPagamentoAnticipatoFieldSpecified;
            }
            set {
                this.scontoPagamentoAnticipatoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="date")]
        public System.DateTime DataLimitePagamentoAnticipato {
            get {
                return this.dataLimitePagamentoAnticipatoField;
            }
            set {
                this.dataLimitePagamentoAnticipatoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataLimitePagamentoAnticipatoSpecified {
            get {
                return this.dataLimitePagamentoAnticipatoFieldSpecified;
            }
            set {
                this.dataLimitePagamentoAnticipatoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal PenalitaPagamentiRitardati {
            get {
                return this.penalitaPagamentiRitardatiField;
            }
            set {
                this.penalitaPagamentiRitardatiField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool PenalitaPagamentiRitardatiSpecified {
            get {
                return this.penalitaPagamentiRitardatiFieldSpecified;
            }
            set {
                this.penalitaPagamentiRitardatiFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="date")]
        public System.DateTime DataDecorrenzaPenale {
            get {
                return this.dataDecorrenzaPenaleField;
            }
            set {
                this.dataDecorrenzaPenaleField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataDecorrenzaPenaleSpecified {
            get {
                return this.dataDecorrenzaPenaleFieldSpecified;
            }
            set {
                this.dataDecorrenzaPenaleFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string CodicePagamento {
            get {
                return this.codicePagamentoField;
            }
            set {
                this.codicePagamentoField = value;
            }
        }
    }
}