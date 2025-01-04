namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiGeneraliType {
    
        private DatiGeneraliDocumentoType datiGeneraliDocumentoField;
    
        private DatiDocumentiCorrelatiType[] datiOrdineAcquistoField;
    
        private DatiDocumentiCorrelatiType[] datiContrattoField;
    
        private DatiDocumentiCorrelatiType[] datiConvenzioneField;
    
        private DatiDocumentiCorrelatiType[] datiRicezioneField;
    
        private DatiDocumentiCorrelatiType[] datiFattureCollegateField;
    
        private DatiSALType[] datiSALField;
    
        private DatiDDTType[] datiDDTField;
    
        private DatiTrasportoType datiTrasportoField;
    
        private FatturaPrincipaleType fatturaPrincipaleField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiGeneraliDocumentoType DatiGeneraliDocumento {
            get {
                return this.datiGeneraliDocumentoField;
            }
            set {
                this.datiGeneraliDocumentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DatiOrdineAcquisto", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiDocumentiCorrelatiType[] DatiOrdineAcquisto {
            get {
                return this.datiOrdineAcquistoField;
            }
            set {
                this.datiOrdineAcquistoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DatiContratto", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiDocumentiCorrelatiType[] DatiContratto {
            get {
                return this.datiContrattoField;
            }
            set {
                this.datiContrattoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DatiConvenzione", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiDocumentiCorrelatiType[] DatiConvenzione {
            get {
                return this.datiConvenzioneField;
            }
            set {
                this.datiConvenzioneField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DatiRicezione", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiDocumentiCorrelatiType[] DatiRicezione {
            get {
                return this.datiRicezioneField;
            }
            set {
                this.datiRicezioneField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DatiFattureCollegate", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiDocumentiCorrelatiType[] DatiFattureCollegate {
            get {
                return this.datiFattureCollegateField;
            }
            set {
                this.datiFattureCollegateField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DatiSAL", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiSALType[] DatiSAL {
            get {
                return this.datiSALField;
            }
            set {
                this.datiSALField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DatiDDT", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiDDTType[] DatiDDT {
            get {
                return this.datiDDTField;
            }
            set {
                this.datiDDTField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiTrasportoType DatiTrasporto {
            get {
                return this.datiTrasportoField;
            }
            set {
                this.datiTrasportoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public FatturaPrincipaleType FatturaPrincipale {
            get {
                return this.fatturaPrincipaleField;
            }
            set {
                this.fatturaPrincipaleField = value;
            }
        }
    }
}