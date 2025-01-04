using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class RappresentanteFiscaleCessionarioType {
    
        private IdFiscaleType idFiscaleIVAField;
    
        private string[] itemsField;
    
        private ItemsChoiceType1[] itemsElementNameField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public IdFiscaleType IdFiscaleIVA {
            get {
                return this.idFiscaleIVAField;
            }
            set {
                this.idFiscaleIVAField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("Cognome", typeof(string), Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        [System.Xml.Serialization.XmlElementAttribute("Denominazione", typeof(string), Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        [System.Xml.Serialization.XmlElementAttribute("Nome", typeof(string), Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        [System.Xml.Serialization.XmlChoiceIdentifierAttribute("ItemsElementName")]
        public string[] Items {
            get {
                return this.itemsField;
            }
            set {
                this.itemsField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("ItemsElementName")]
        [System.Xml.Serialization.XmlIgnoreAttribute()]
        public ItemsChoiceType1[] ItemsElementName {
            get {
                return this.itemsElementNameField;
            }
            set {
                this.itemsElementNameField = value;
            }
        }
    }
}