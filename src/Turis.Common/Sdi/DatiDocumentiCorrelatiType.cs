namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiDocumentiCorrelatiType {
    
        private string[] riferimentoNumeroLineaField;
    
        private string idDocumentoField;
    
        private System.DateTime dataField;
    
        private bool dataFieldSpecified;
    
        private string numItemField;
    
        private string codiceCommessaConvenzioneField;
    
        private string codiceCUPField;
    
        private string codiceCIGField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("RiferimentoNumeroLinea", Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="integer")]
        public string[] RiferimentoNumeroLinea {
            get {
                return this.riferimentoNumeroLineaField;
            }
            set {
                this.riferimentoNumeroLineaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string IdDocumento {
            get {
                return this.idDocumentoField;
            }
            set {
                this.idDocumentoField = value;
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
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public bool DataSpecified {
            get {
                return this.dataFieldSpecified;
            }
            set {
                this.dataFieldSpecified = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string NumItem {
            get {
                return this.numItemField;
            }
            set {
                this.numItemField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string CodiceCommessaConvenzione {
            get {
                return this.codiceCommessaConvenzioneField;
            }
            set {
                this.codiceCommessaConvenzioneField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string CodiceCUP {
            get {
                return this.codiceCUPField;
            }
            set {
                this.codiceCUPField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string CodiceCIG {
            get {
                return this.codiceCIGField;
            }
            set {
                this.codiceCIGField = value;
            }
        }
    }
}