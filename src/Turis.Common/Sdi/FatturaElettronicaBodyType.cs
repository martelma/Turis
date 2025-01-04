namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class FatturaElettronicaBodyType {
    
        private DatiGeneraliType datiGeneraliField;
    
        private DatiBeniServiziType datiBeniServiziField;
    
        private DatiVeicoliType datiVeicoliField;
    
        private DatiPagamentoType[] datiPagamentoField;
    
        private AllegatiType[] allegatiField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiGeneraliType DatiGenerali {
            get {
                return this.datiGeneraliField;
            }
            set {
                this.datiGeneraliField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiBeniServiziType DatiBeniServizi {
            get {
                return this.datiBeniServiziField;
            }
            set {
                this.datiBeniServiziField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiVeicoliType DatiVeicoli {
            get {
                return this.datiVeicoliField;
            }
            set {
                this.datiVeicoliField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DatiPagamento", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiPagamentoType[] DatiPagamento {
            get {
                return this.datiPagamentoField;
            }
            set {
                this.datiPagamentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("Allegati", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public AllegatiType[] Allegati {
            get {
                return this.allegatiField;
            }
            set {
                this.allegatiField = value;
            }
        }
    }
}