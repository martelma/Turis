using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiRitenutaType {
    
        private TipoRitenutaType tipoRitenutaField;
    
        private decimal importoRitenutaField;
    
        private decimal aliquotaRitenutaField;
    
        private CausalePagamentoType causalePagamentoField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public TipoRitenutaType TipoRitenuta {
            get {
                return this.tipoRitenutaField;
            }
            set {
                this.tipoRitenutaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal ImportoRitenuta {
            get {
                return this.importoRitenutaField;
            }
            set {
                this.importoRitenutaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public decimal AliquotaRitenuta {
            get {
                return this.aliquotaRitenutaField;
            }
            set {
                this.aliquotaRitenutaField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public CausalePagamentoType CausalePagamento {
            get {
                return this.causalePagamentoField;
            }
            set {
                this.causalePagamentoField = value;
            }
        }
    }
}