--DECLARE @DocumentIds NVarChar(MAX)
--SET @DocumentIds = '3752533'

--Document Info
;WITH cteIds as
(
	SELECT value as DocumentID 
	  FROM STRING_SPLIT(@DocumentIds, ',')
)
, cteRevNb as 
(
	SELECT UserRevs.DocumentID
		 , UserRevs.UserRevID
		 , UserRevs.RevNr as RevisionNumber
		 , ISNULL(LAG(UserRevs.RevNr - 1) OVER (PARTITION BY UserRevs.DocumentID ORDER BY UserRevs.UserRevID DESC), 1000000) AS LastRevisionNumber
	  FROM UserRevs WITH(NOLOCK)
		INNER JOIN cteIds
			on cteIds.DocumentID = UserRevs.DocumentID
)
, cteDocuments as
(
	SELECT DISTINCT doc.*
		 , rn.RevisionNumber
		 , rn.LastRevisionNumber
	  FROM Documents doc WITH(NOLOCK)
		INNER JOIN cteRevNb rn
			ON rn.DocumentID = doc.DocumentID
				
	 WHERE doc.Deleted = 0
	   AND doc.Shared = 1
	   AND doc.ObjectTypeID = 1
	   AND doc.ExtensionID in (3, 4, 5)
	   AND doc.CurrentStatusID IN (14, 104, 565, 559, 179)
)
--select * from cteDocuments
, cteDrawCodeRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cteDocuments.DocumentID, cteDocuments.RevisionNumber, vv.ConfigurationID ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cteDocuments.DocumentID
		 , cteDocuments.RevisionNumber
		 , cteDocuments.LastRevisionNumber
		 , vv.ValueText AS DrawCode
		 , vv.ConfigurationID
	  FROM cteDocuments
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 153
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cteDocuments.DocumentID
				AND vv.RevisionNo <= cteDocuments.LastRevisionNumber
)
--select * from cteDrawCodeRowNun
, cteDrawCode AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, DrawCode, ConfigurationID
	  FROM cteDrawCodeRowNun 
	 WHERE RowNun = 1
)
--select * from cteDrawCode
, cteRevLetterRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cteDocuments.DocumentID, cteDocuments.RevisionNumber, vv.ConfigurationID ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cteDocuments.DocumentID
		 , cteDocuments.RevisionNumber
		 , cteDocuments.LastRevisionNumber
		 , vv.ValueText AS RevisionLetter
		 , vv.ConfigurationID
	 FROM cteDocuments
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 51 
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cteDocuments.DocumentID
				AND vv.RevisionNo <= cteDocuments.LastRevisionNumber
)
, cteRevLetter AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, RevisionLetter, ConfigurationID
	  FROM cteRevLetterRowNun 
	 WHERE RowNun = 1
)
, cteRevUserRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cteDocuments.DocumentID, cteDocuments.RevisionNumber ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cteDocuments.DocumentID
		 , cteDocuments.RevisionNumber
		 , cteDocuments.LastRevisionNumber
		 , vv.ValueText AS RevUser
	  FROM cteDocuments
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 204
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cteDocuments.DocumentID
				AND vv.RevisionNo <= cteDocuments.LastRevisionNumber
)
, cteRevUser AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, RevUser
	  FROM cteRevUserRowNun 
	 WHERE RowNun = 1
)
, cteRevisionDateRowNun as
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cteDocuments.DocumentID, cteDocuments.RevisionNumber ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cteDocuments.DocumentID
		 , cteDocuments.RevisionNumber
		 , cteDocuments.LastRevisionNumber
		 , vv.ValueDate AS RevisionDate
	 FROM cteDocuments
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 202
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cteDocuments.DocumentID
				AND vv.RevisionNo <= cteDocuments.LastRevisionNumber
)
, cteRevisionDate AS
(
	SELECT DISTINCT * 
	  FROM cteRevisionDateRowNun 
	 WHERE RowNun = 1
)
, cteCncRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cteDocuments.DocumentID, cteDocuments.RevisionNumber ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cteDocuments.DocumentID
		 , cteDocuments.RevisionNumber
		 , cteDocuments.LastRevisionNumber
		 , vv.ValueText AS Cnc
	  FROM cteDocuments
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 163
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cteDocuments.DocumentID
				AND vv.RevisionNo <= cteDocuments.LastRevisionNumber
)
, cteCnc AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, Cnc
	  FROM cteCncRowNun 
	 WHERE RowNun = 1
)
, cteEcoCodeRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cteDocuments.DocumentID, cteDocuments.RevisionNumber ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cteDocuments.DocumentID
		 , cteDocuments.RevisionNumber
		 , cteDocuments.LastRevisionNumber
		 , vv.ValueText AS EcoCode
	 FROM cteDocuments
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 203 
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cteDocuments.DocumentID
				AND vv.RevisionNo <= cteDocuments.LastRevisionNumber
	 WHERE LEN(vv.ValueText) > 0
)
, cteEcoCode AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, EcoCode
	  FROM cteEcoCodeRowNun 
	 WHERE RowNun = 1
)
, cteEcoDescriptionRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cteDocuments.DocumentID, cteDocuments.RevisionNumber ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cteDocuments.DocumentID
		 , cteDocuments.RevisionNumber
		 , cteDocuments.LastRevisionNumber
		 , vv.ValueText AS EcoDescription
	 FROM cteDocuments
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 198 
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cteDocuments.DocumentID
				AND vv.RevisionNo <= cteDocuments.LastRevisionNumber
	 WHERE LEN(vv.ValueText) > 0
)
--select * from cteEcoDescriptionRowNun
, cteEcoDescription AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, EcoDescription
	  FROM cteEcoDescriptionRowNun 
	 WHERE RowNun = 1
)
, cteEco as
(
	SELECT docs.DocumentId
		 , REPLACE(Filename, '.ecc', '') as EcoCode
		 , vv.ValueText as EcoSeverity
	  FROM Documents docs WITH(NOLOCK)
		INNER JOIN VariableValue vv WITH(NOLOCK)
			ON docs.DocumentID = vv.DocumentID
	 WHERE ExtensionID = 158
	   AND vv.VariableID = 181
)
, cteData as
(
	SELECT DISTINCT 'PDM|' + LTRIM(STR(cteDocuments.DocumentID)) + '|'  + LTRIM(cteDrawCode.DrawCode) + '|' + cteRevLetter.RevisionLetter  as UniqueSourceKey
		 , cteDocuments.DocumentID 
		 , cteDocuments.Filename
		 , cteDocuments.ExtensionID as [Type]
		 , cteDocuments.RevisionNumber
		 , cteDocuments.LastRevisionNumber
		 , conf.ConfigurationID
		 , conf.ConfigurationName
		 , cteDrawCode.DrawCode
		 , cteRevLetter.RevisionLetter
		 --, cteRevUser.RevUser
		 , u.FullName as RevisionUser
		 , cteRevisionDate.RevisionDate
		 , cteCnc.Cnc
		 , cteEcoCode.EcoCode
		 , cteEcoDescription.EcoDescription
		 , cteEco.EcoSeverity
	  FROM cteDocuments
		INNER JOIN cteDrawCode
			ON cteDocuments.DocumentID = cteDrawCode.DocumentID
				AND cteDocuments.RevisionNumber = cteDrawCode.RevisionNumber
		INNER JOIN cteRevLetter
			ON cteDocuments.DocumentID = cteRevLetter.DocumentID
				AND cteDocuments.RevisionNumber = cteRevLetter.RevisionNumber
				AND cteDrawCode.ConfigurationID = cteRevLetter.ConfigurationID
		LEFT OUTER JOIN cteRevUser
			ON cteDocuments.DocumentID = cteRevUser.DocumentID
				AND cteDocuments.RevisionNumber = cteRevUser.RevisionNumber
		LEFT OUTER JOIN cteRevisionDate
			ON cteDocuments.DocumentID = cteRevisionDate.DocumentID
				AND cteDocuments.RevisionNumber = cteRevisionDate.RevisionNumber
		LEFT OUTER JOIN cteCnc
			ON cteDocuments.DocumentID = cteCnc.DocumentID
				AND cteDocuments.RevisionNumber = cteCnc.RevisionNumber
		LEFT OUTER JOIN cteEcoCode
			ON cteDocuments.DocumentID = cteEcoCode.DocumentID
				AND cteDocuments.RevisionNumber = cteEcoCode.RevisionNumber
		LEFT OUTER JOIN cteEcoDescription
			ON cteDocuments.DocumentID = cteEcoDescription.DocumentID
				AND cteDocuments.RevisionNumber = cteEcoDescription.RevisionNumber
		LEFT OUTER JOIN cteEco
			ON cteEcoCode.EcoCode = cteEco.EcoCode
				AND cteDrawCode.RevisionNumber = cteEcoDescription.RevisionNumber
		LEFT OUTER JOIN Users u WITH(NOLOCK)
			on cteRevUser.RevUser = u.Username
			
		INNER JOIN DocumentRevisionConfiguration drc WITH(NOLOCK)
			on drc.ConfigurationID = cteRevLetter.ConfigurationID
				and drc.DocumentID = cteDocuments.DocumentID
				and drc.RevisionNo = cteDocuments.RevisionNumber
		INNER JOIN DocumentConfiguration conf WITH(NOLOCK)
			on drc.ConfigurationID = conf.ConfigurationID
)
SELECT DISTINCT *
  FROM cteData
 WHERE UniqueSourceKey IS NOT NULL

--Dove è usato!
;WITH cteIds as
(
	SELECT value as DocumentID 
	  FROM STRING_SPLIT(@DocumentIds, ',')
)
, cteParent as
(
	--dove è usato
	SELECT DISTINCT ref.XRefDocument as [Key]
		 , ref.XRefRevNr
		 , ref.RevNr
		 , docParent.DocumentID
		 , docParent.ExtensionID
		 , docParent.Filename
		 , refConf.ConfigurationID
		 , conf.ConfigurationName
	  FROM XRefs ref WITH(NOLOCK)

			INNER JOIN cteIds
				on ref.XRefDocument = cteIds.DocumentID

			INNER JOIN XRefConfiguration refConf WITH(NOLOCK)
				on ref.XRefID = refConf.XRefID

			INNER JOIN DocumentConfiguration conf WITH(NOLOCK)
				on refConf.ConfigurationID = conf.ConfigurationID
					AND conf.ConfigurationID <> 2

			INNER JOIN Documents docParent WITH(NOLOCK)
				on ref.DocumentID = docParent.DocumentID
					AND docParent.ExtensionID in (3, 4, 5, 19, 49)
					AND docParent.CurrentStatusID IN (14, 104, 565, 559, 179)
					AND docParent.Deleted = 0
					AND docParent.Shared = 1
)
--select * from cteParent
, cteParentXRefIds as
(
	SELECT DISTINCT [Key]
	  FROM cteParent
)
, cteXRefRevNb as 
(
	SELECT UserRevs.DocumentID
		 , UserRevs.UserRevID
		 , UserRevs.RevNr as RevisionNumber
		 , ISNULL(LAG(UserRevs.RevNr - 1) OVER (PARTITION BY UserRevs.DocumentID ORDER BY UserRevs.UserRevID DESC), 1000000) AS LastRevisionNumber
	  FROM UserRevs WITH(NOLOCK)
	  		INNER JOIN cteParentXRefIds
				ON cteParentXRefIds.[Key] = UserRevs.DocumentID
)
--select * from cteXRefRevNb
, cteParentIds as
(
	SELECT DISTINCT DocumentID
	  FROM cteParent
)
, cteRevNb as 
(
	SELECT UserRevs.DocumentID
		 , UserRevs.UserRevID
		 , UserRevs.RevNr as RevisionNumber
		 , ISNULL(LAG(UserRevs.RevNr - 1) OVER (PARTITION BY UserRevs.DocumentID ORDER BY UserRevs.UserRevID DESC), 1000000) AS LastRevisionNumber
	  FROM UserRevs WITH(NOLOCK)
	  		INNER JOIN cteParentIds
				ON cteParentIds.DocumentID = UserRevs.DocumentID
)
--select * from cteRevNb order by DocumentID, RevisionNumber
, cte as
(
	SELECT cteParent.*
		 , rn.RevisionNumber
		 , rn.LastRevisionNumber
		 , rnKey.RevisionNumber as RevisionNumberKey
		 , rnKey.LastRevisionNumber as LastRevisionNumberKey
	  FROM cteParent
			INNER JOIN cteRevNb rn
				ON rn.DocumentID = cteParent.DocumentID
			INNER JOIN cteXRefRevNb rnKey
				ON rnKey.DocumentID = cteParent.[Key]
	 WHERE XRefRevNr >= rnKey.RevisionNumber and XRefRevNr <= rnKey.LastRevisionNumber
	   AND RevNr >= rn.RevisionNumber and RevNr <= rn.LastRevisionNumber
)
--select * from cte where ExtensionID = 4 order by DocumentID, RevisionNumber
, cteDrawCodeRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cte.DocumentID, cte.RevisionNumber, vv.ConfigurationID ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cte.DocumentID
		 , cte.RevisionNumber
		 , cte.LastRevisionNumber
		 , vv.ValueText AS DrawCode
		 , vv.ConfigurationID
	  FROM cte
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 153
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cte.DocumentID
				AND vv.RevisionNo <= cte.LastRevisionNumber
)
, cteDrawCode AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, DrawCode, ConfigurationID
	  FROM cteDrawCodeRowNun 
	 WHERE RowNun = 1
)
, cteRevLetterRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cte.DocumentID, cte.RevisionNumber, vv.ConfigurationID ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cte.DocumentID
		 , cte.RevisionNumber
		 , cte.LastRevisionNumber
		 , vv.ValueText AS RevisionLetter
		 , vv.ConfigurationID
	 FROM cte
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 51 
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cte.DocumentID
				AND vv.RevisionNo <= cte.LastRevisionNumber
)
, cteRevLetter AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, RevisionLetter, ConfigurationID
	  FROM cteRevLetterRowNun 
	 WHERE RowNun = 1
	   AND LEN(TRIM(RevisionLetter)) > 0
)
, cteCncRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cte.DocumentID, cte.RevisionNumber ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cte.DocumentID
		 , cte.RevisionNumber
		 , cte.LastRevisionNumber
		 , vv.ValueText AS Cnc
	  FROM cte
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 163
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cte.DocumentID
				AND vv.RevisionNo <= cte.LastRevisionNumber
)
SELECT DISTINCT 'PDM|' + LTRIM(STR(cte.DocumentID)) + '|'  + LTRIM(cteDrawCode.DrawCode) + '|' + cteRevLetter.RevisionLetter  as UniqueSourceKey
	 , cte.[Key]
	 , cte.RevisionNumberKey
	 , cte.LastRevisionNumberKey
	 , cte.DocumentID 
	 , cte.Filename
	 , cte.ExtensionID as [Type]
	 , cte.XRefRevNr
	 , cte.RevNr
	 , cte.RevisionNumber
	 , cte.LastRevisionNumber
	 , cteDrawCode.DrawCode
	 , cteRevLetter.RevisionLetter
	 , conf.ConfigurationID
	 , conf.ConfigurationName
  FROM cte
	INNER JOIN cteDrawCode
		ON cte.DocumentID = cteDrawCode.DocumentID
			AND cte.RevisionNumber = cteDrawCode.RevisionNumber
	INNER JOIN cteRevLetter
		ON cte.DocumentID = cteRevLetter.DocumentID
			AND cte.RevisionNumber = cteRevLetter.RevisionNumber
			AND cteDrawCode.ConfigurationID = cteRevLetter.ConfigurationID
			
	INNER JOIN DocumentRevisionConfiguration drc WITH(NOLOCK)
		on drc.ConfigurationID = cteRevLetter.ConfigurationID
			and drc.DocumentID = cte.DocumentID
			and drc.RevisionNo = cte.RevisionNumber
	INNER JOIN DocumentConfiguration conf WITH(NOLOCK)
		on drc.ConfigurationID = conf.ConfigurationID

--Cosa contiene
;WITH cteIds as
(
	SELECT value as DocumentID 
	  FROM STRING_SPLIT(@DocumentIds, ',')
)
, cteChildren as
(
	--dove è usato
	SELECT DISTINCT ref.DocumentID as [Key]
		 , ref.XRefRevNr
		 , ref.RevNr
		 , docChild.DocumentID
		 , docChild.ExtensionID
		 , docChild.Filename
		 , refConf.ConfigurationID
		 , conf.ConfigurationName
	  FROM XRefs ref WITH(NOLOCK)

			INNER JOIN cteIds
				on ref.DocumentID = cteIds.DocumentID

			INNER JOIN Documents docChild WITH(NOLOCK)
				on ref.XRefDocument = docChild.DocumentID
					AND docChild.ExtensionID in (3, 4, 5, 19, 49)
					AND docChild.CurrentStatusID IN (14, 104, 565, 559, 179)
					AND docChild.Deleted = 0
					AND docChild.Shared = 1

			INNER JOIN XRefConfiguration refConf WITH(NOLOCK)
				on ref.XRefID = refConf.XRefID

			INNER JOIN DocumentConfiguration conf WITH(NOLOCK)
				on refConf.XRefConfigurationID = conf.ConfigurationID
					AND conf.ConfigurationID <> 2
)
--select * from cteChildren
, cteChildrenXRefIds as
(
	SELECT DISTINCT [Key]
	  FROM cteChildren
)
, cteXRefRevNb as 
(
	SELECT UserRevs.DocumentID
		 , UserRevs.UserRevID
		 , UserRevs.RevNr as RevisionNumber
		 , ISNULL(LAG(UserRevs.RevNr - 1) OVER (PARTITION BY UserRevs.DocumentID ORDER BY UserRevs.UserRevID DESC), 1000000) AS LastRevisionNumber
	  FROM UserRevs WITH(NOLOCK)
	  		INNER JOIN cteChildrenXRefIds
				ON cteChildrenXRefIds.[Key] = UserRevs.DocumentID
)
--select * from cteXRefRevNb
, cteChildrenIds as
(
	SELECT DISTINCT DocumentID
	  FROM cteChildren
)
--select * from cteChildrenIds
, cteRevNb as 
(
	SELECT UserRevs.DocumentID
		 , UserRevs.UserRevID
		 , UserRevs.RevNr as RevisionNumber
		 , ISNULL(LAG(UserRevs.RevNr - 1) OVER (PARTITION BY UserRevs.DocumentID ORDER BY UserRevs.UserRevID DESC), 1000000) AS LastRevisionNumber
	  FROM UserRevs WITH(NOLOCK)
	  		INNER JOIN cteChildrenIds
				ON cteChildrenIds.DocumentID = UserRevs.DocumentID
)
--select * from cteRevNb
, cte as
(
	SELECT DISTINCT cteChildren.*
		 , rn.RevisionNumber
		 , rn.LastRevisionNumber
		 , rnKey.RevisionNumber as RevisionNumberKey
		 , rnKey.LastRevisionNumber as LastRevisionNumberKey
	  FROM cteChildren
			INNER JOIN cteRevNb rn
				ON rn.DocumentID = cteChildren.DocumentID
			INNER JOIN cteXRefRevNb rnKey
				ON rnKey.DocumentID = cteChildren.[Key]
	 WHERE XRefRevNr >= rnKey.RevisionNumber and XRefRevNr <= rnKey.LastRevisionNumber
	   AND RevNr >= rn.RevisionNumber and RevNr <= rn.LastRevisionNumber
)
--select * from cte
--where RevNr >= RevisionNumberKey and RevNr < LastRevisionNumberKey
--and XRefRevNr >= RevisionNumber and XRefRevNr < LastRevisionNumber
, cteDrawCodeRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cte.DocumentID, cte.RevisionNumber, vv.ConfigurationID ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cte.DocumentID
		 , cte.RevisionNumber
		 , cte.LastRevisionNumber
		 , vv.ValueText AS DrawCode
		 , vv.ConfigurationID
	  FROM cte
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 153
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cte.DocumentID
				AND vv.RevisionNo <= cte.LastRevisionNumber
)
, cteDrawCode AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, DrawCode, ConfigurationID
	  FROM cteDrawCodeRowNun 
	 WHERE RowNun = 1
)
--select * from cteDrawCode
, cteRevLetterRowNun AS
(
	SELECT ROW_NUMBER() OVER (PARTITION BY cte.DocumentID, cte.RevisionNumber, vv.ConfigurationID ORDER BY vv.RevisionNo DESC) AS RowNun
		 , cte.DocumentID
		 , cte.RevisionNumber
		 , cte.LastRevisionNumber
		 , vv.ValueText AS RevisionLetter
		 , vv.ConfigurationID
	 FROM cte
		LEFT OUTER JOIN VariableValue vv WITH(NOLOCK) 
			ON vv.VariableID = 51 
				AND vv.ConfigurationID <> 2
				AND vv.DocumentID = cte.DocumentID
				AND vv.RevisionNo <= cte.LastRevisionNumber
)
, cteRevLetter AS
(
	SELECT DISTINCT DocumentID, RevisionNumber, LastRevisionNumber, RevisionLetter, ConfigurationID
	  FROM cteRevLetterRowNun 
	 WHERE RowNun = 1
	   AND LEN(TRIM(RevisionLetter)) > 0
)
--select * from cteRevLetter
SELECT DISTINCT 'PDM|' + LTRIM(STR(cte.DocumentID)) + '|'  + LTRIM(cteDrawCode.DrawCode) + '|' + cteRevLetter.RevisionLetter  as UniqueSourceKey
	 , cte.[Key]
	 , cte.RevisionNumberKey
	 , cte.LastRevisionNumberKey
	 , cte.DocumentID 
	 , cte.Filename
	 , cte.ExtensionID as [Type]
	 , cte.RevNr
	 , cte.XRefRevNr
	 , cte.RevisionNumber
	 , cte.LastRevisionNumber
	 , cteDrawCode.DrawCode
	 , cteRevLetter.RevisionLetter
	 , conf.ConfigurationID
	 , conf.ConfigurationName
  FROM cte
	INNER JOIN cteDrawCode
		ON cte.DocumentID = cteDrawCode.DocumentID
			AND cte.RevisionNumber = cteDrawCode.RevisionNumber
	INNER JOIN cteRevLetter
		ON cte.DocumentID = cteRevLetter.DocumentID
			AND cte.RevisionNumber = cteRevLetter.RevisionNumber
			AND cteDrawCode.ConfigurationID = cteRevLetter.ConfigurationID
			
	INNER JOIN DocumentRevisionConfiguration drc WITH(NOLOCK)
		on drc.ConfigurationID = cteRevLetter.ConfigurationID
			and drc.DocumentID = cte.DocumentID
			and drc.RevisionNo = cte.RevisionNumber
	INNER JOIN DocumentConfiguration conf WITH(NOLOCK)
		on drc.ConfigurationID = conf.ConfigurationID
