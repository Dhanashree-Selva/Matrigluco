package com.matrigluco.app.legal.presentation.licenses

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.matrigluco.app.databinding.FragmentOpenSourceLicenseDetailBinding
import com.matrigluco.app.legal.data.OpenSourceLibraryRepository
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class OpenSourceLicenseDetailFragment : Fragment() {

    private var _binding: FragmentOpenSourceLicenseDetailBinding? = null
    private val binding get() = _binding!!

    @Inject
    lateinit var repository: OpenSourceLibraryRepository

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOpenSourceLicenseDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val libraryName = arguments?.getString("libraryName").orEmpty()
        val library = repository.getLibraryByName(libraryName)

        if (library != null) {
            binding.libraryDetailName.text = library.name
            binding.libraryDetailVersion.text = library.version?.let { "Version $it" }.orEmpty()
            binding.libraryDetailLicenseBadge.text = library.licenseName
            binding.libraryDetailDesc.text = library.description
            binding.libraryDetailLicenseText.text = library.licenseText

            if (!library.projectUrl.isNullOrBlank()) {
                binding.btnOpenProject.visibility = View.VISIBLE
                binding.btnOpenProject.setOnClickListener {
                    val url = library.projectUrl
                    if (url.startsWith("http://") || url.startsWith("https://")) {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                    } else {
                        Toast.makeText(requireContext(), "Invalid URL", Toast.LENGTH_SHORT).show()
                    }
                }
            } else {
                binding.btnOpenProject.visibility = View.GONE
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
