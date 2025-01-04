using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiGeneraliDocumentoType {
    
        private TipoDocumentoType tipoDocumentoField;
    
        private string divisaField;
    
        private System.DateTime dataField;
    
        private string numeroField;
    
        private DatiRitenutaType datiRitenutaField;
    
        private DatiBolloType datiBolloField;
    
        private DatiCassaPrevidenzialeType[] datiCassaPrevidenzialeField;
    
        private ScontoMaggiorazioneType[] scontoMaggiorazioneField;
    
        private decimal importoTotaleDocumentoField;
    
        private bool importoTotaleDocumentoFieldSpecified;
    
        private decimal arrotondamentoField;
    
        private bool arrotondamentoFieldSpecified;
    
        private string[] causaleField;
    
        private Art73Type art73Field;
    
        private bool art73FieldSpecified;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public TipoDocumentoType TipoDocumento {
            get {
                return this.tipoDocumentoField;
            }
            set {
                this.tipoDocumentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string Divisa {
            get {
                return this.divisaField;
            }
            set {
                this.divisaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="date")]
        public System.DateTime Data {
            get {
                return this.dataField;
            }
            set {
                this.dataField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string Numero {
            get {
                return this.numeroField;
            }
            set {
                this.numeroField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiRitenutaType DatiRitenuta {
            get {
                return this.datiRitenutaField;
            }
            set {
                this.datiRitenutaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiBolloType DatiBollo {
            get {
                return this.datiBolloField;
            }
            set {
                this.datiBolloField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DatiCassaPrevidenziale", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiCassaPrevidenzialeType[] DatiCassaPrevidenziale {
            get {
                return this.datiCassaPrevidenzialeField;
            }
            set {
                this.datiCassaPrevidenzialeField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("ScontoMaggiorazione", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public ScontoMaggiorazioneType[] ScontoMaggiorazione {
            get {
                return this.scontoMaggiorazioneField;
            }
            set {
                this.scontoMaggiorazioneField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal ImportoTotaleDocumento {
            get {
                return this.importoTotaleDocumentoField;
            }
            set {
                this.importoTotaleDocumentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool ImportoTotaleDocumentoSpecified {
            get {
                return this.importoTotaleDocumentoFieldSpecified;
            }
            set {
                this.importoTotaleDocumentoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal Arrotondamento {
            get {
                return this.arrotondamentoField;
            }
            set {
                this.arrotondamentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool ArrotondamentoSpecified {
            get {
                return this.arrotondamentoFieldSpecified;
            }
            set {
                this.arrotondamentoFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("Causale", Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string[] Causale {
            get {
                return this.causaleField;
            }
            set {
                this.causaleField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public Art73Type Art73 {
            get {
                return this.art73Field;
            }
            set {
                this.art73Field = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool Art73Specified {
            get {
                return this.art73FieldSpecified;
            }
            set {
                this.art73FieldSpecified = value;
            }
        }
    }
}