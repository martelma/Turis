using System.Diagnostics;
using System.Reflection;

namespace Turis.Common.Helpers;

public class AssemblyHelper
{
	public static IEnumerable<Assembly> GetRecursiveAssemblies()
	{
		return GetRecursiveAssemblies(AssemblyDirectory);
	}

	public static IEnumerable<Assembly> GetRecursiveAssemblies(string path)
	{
		var assemblies = new List<Assembly>();

		foreach (var directoryPath in Directory.GetDirectories(path))
		{
			var directoryInfo = new DirectoryInfo(directoryPath);
			foreach (var fileInfo in directoryInfo.GetFiles("*.dll"))
			{
				var assembly = Assembly.LoadFrom(fileInfo.FullName);
				if (!assemblies.Exists(x => x.FullName == assembly.FullName))
					assemblies.Add(assembly);
			}
			assemblies.AddRange(GetRecursiveAssemblies(directoryPath));
		}
		return assemblies;
	}

	public static string AssemblyDirectory
	{
		get
		{
			var codeBase = Assembly.GetExecutingAssembly().CodeBase;
			var uri = new UriBuilder(codeBase);
			var path = Uri.UnescapeDataString(uri.Path);
			return Path.GetDirectoryName(path);
		}
	}

	public static string CurrentMethodFullName()
	{
		//var currentMethod = MethodBase.GetCurrentMethod();
		//return $"{currentMethod?.DeclaringType?.FullName}.{currentMethod?.Name}";

		var stackFrame = new StackTrace().GetFrame(1);
		var currentMethod = stackFrame.GetMethod();
		return $"{currentMethod?.DeclaringType?.FullName}.{currentMethod?.Name}";
	}
}