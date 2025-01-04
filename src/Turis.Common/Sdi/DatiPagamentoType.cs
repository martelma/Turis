using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiPagamentoType {
    
        private CondizioniPagamentoType condizioniPagamentoField;
    
        private DettaglioPagamentoType[] dettaglioPagamentoField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public CondizioniPagamentoType CondizioniPagamento {
            get {
                return this.condizioniPagamentoField;
            }
            set {
                this.condizioniPagamentoField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DettaglioPagamento", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DettaglioPagamentoType[] DettaglioPagamento {
            get {
                return this.dettaglioPagamentoField;
            }
            set {
                this.dettaglioPagamentoField = value;
            }
        }
    }
}