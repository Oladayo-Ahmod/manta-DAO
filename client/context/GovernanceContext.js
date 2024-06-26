"use client"

import React,{createContext,useEffect,useState} from 'react'
import {ADDRESS,ABI} from '../constants/index'
import {ethers,parseEther,formatEther} from 'ethers'
import { Wallet } from "zksync-ethers";

import Router from 'next/router'
import Swal from "sweetalert2"

const GOVERNANCE_CONTEXT = createContext()

let connect
if(typeof window !=='undefined'){
    connect = window.ethereum
}
const Government_provider =({children})=>{

    useEffect(()=>{
       if (connect) {
            connect.on('accountsChanged',()=>{
                Router.push('/')
            })
       }
    })

    const [account,setAccount] = useState()
    const [amount,setAmount] = useState()
    const [disability,setDisability] = useState(false)
    const [totalBalance, setTotalBalance] = useState(0)
    const [stakeholderBalance, setStakeholderBalance] = useState(0)
    const [contributorBalance, setContributorBalance] = useState(0)
    const [stakeholderStatus , setStakeholderStatus] = useState(false)
    const [contributorStatus , setContributorStatus] = useState(false)
    const [proposalsData, setProposalsData] = useState()
    const [deployer, setDeployer] = useState()
    const [formData, setFormData] = useState({
        title :'',
        description : '',
        beneficiary : '',
        amount : ''
    })

    const PRIVATE_KEY= process.env.NEXT_PUBLIC_PRIVATE_KEY

    const connectWallet =async function(){
        try {
            if(connect){
                const connector = await connect.request({method : 'eth_requestAccounts'})
                setAccount(connector[0])
                Router.push('/')
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getDeployer =async()=>{
        try {
            const provider = new ethers.BrowserProvider(connect)         
            const wallet = new Wallet(PRIVATE_KEY, provider);
            const contract = new ethers.Contract(ADDRESS,ABI,wallet)
            const deployer = await contract.getDeployer()
            setDeployer(deployer)
        } catch (error) {
            console.log(error);
        }
    }

    const Contribute =async(modalRef)=>{
        try {
            if (amount && connect) {

                if(amount <= 0.006 ){ // check if the amount is greater allowed amount to avoid gas drainage
                    setDisability(true)
                    const provider = new ethers.BrowserProvider(connect)            
                    const wallet = new Wallet(PRIVATE_KEY, provider);
                    const contract = new ethers.Contract(ADDRESS,ABI,wallet)
                    const parsedAmount = parseEther(amount)
                    const tx = await contract.contribute({value : parsedAmount})
                    await tx.wait(1)
                    setDisability(false)
                    const modalElement = modalRef.current ? modalRef.current : ''
                    modalElement.classList.remove('show')
                    modalElement.style.display = 'none'
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        text: `You have successfully contributed ${amount} ETH to the DAO`,
                        showConfirmButton: true,
                        timer: 4000
                    })
                }
                else{
                    setDisability(false)
                    Swal.fire({
                        position: 'top-end',
                        icon: 'warning',
                        text: `Sorry, you can not contribue more than 0.005ETH`,
                        showConfirmButton: true,
                        timer: 4000
                    })
                }
                

            }
            else{
                setDisability(false)
            }
        } catch (error) {
            console.log(error);
        }
        
    }

    const getTotalBalance =async()=>{
        try {
            const provider = new ethers.BrowserProvider(connect)            
            const wallet = new Wallet(PRIVATE_KEY, provider);
            const contract = new ethers.Contract(ADDRESS,ABI,wallet)
            const tx = await contract.getTotalBalance()
            let balance =  formatEther(tx)
            setTotalBalance(balance)
        } catch (error) {
            console.log(error);
        }
       
    }

    const getStakeholderBalance =async()=>{
        if (stakeholderStatus) {
            try {
                const provider = new ethers.BrowserProvider(connect)            
                const wallet = new Wallet(PRIVATE_KEY, provider);
                const contract = new ethers.Contract(ADDRESS,ABI,wallet)
                const tx = await contract.getStakeholdersBalances()
                let balance =  formatEther(tx)
                setStakeholderBalance(balance)
               } catch (error) {
                console.log(error);
               }
        }
       
    }

    const getContributorBalance =async()=>{
            if (contributorStatus) {
                try {
                    const provider = new ethers.BrowserProvider(connect)            
                    const wallet = new Wallet(PRIVATE_KEY, provider);
                    const contract = new ethers.Contract(ADDRESS,ABI,wallet)
                    const tx = await contract.getContributorsBalance()
                    let balance =  formatEther(tx)
                    setContributorBalance(balance)
                   } catch (error) {
                    console.log(error);
                   }    
            }
            
       
    }

    const getStakeholderStatus =async() => {
            try {
                const provider = new ethers.BrowserProvider(connect)            
                const wallet = new Wallet(PRIVATE_KEY, provider);
                const contract = new ethers.Contract(ADDRESS,ABI,wallet)
                const tx = await contract.stakeholderStatus()
                setStakeholderStatus(tx)
            } catch (error) {
                console.log(error);
            }    
        
    }

    const getContributorStatus =async() => {
            try {
                const provider = new ethers.BrowserProvider(connect)            
                const wallet = new Wallet(PRIVATE_KEY, provider);
                const contract = new ethers.Contract(ADDRESS,ABI,wallet)
                const tx = await contract.isContributor()
                setContributorStatus(tx)
            } catch (error) {
                // console.log(error);
            }    
        
    }

    const propose =async(modalRef)=>{
        if (stakeholderStatus) {
            try {
                setDisability(true)
                const {title,description,beneficiary,amount} = formData
                if(amount <= 0.006){
                    let parsedAmount = parseEther(amount);
                    const provider = new ethers.BrowserProvider(connect)            
                    const wallet = new Wallet(PRIVATE_KEY, provider);
                    const contract = new ethers.Contract(ADDRESS,ABI,wallet)
                    const propose = await contract.createProposal(title,description,beneficiary.trim(),parsedAmount)
                    await propose.wait(1)
                    setDisability(false)
                    const modalElement = modalRef.current ? modalRef.current : ''
                    modalElement.classList.remove('show')
                    modalElement.style.display = 'none'
                    Swal.fire({
                        position: 'top-end',
                        icon: 'success',
                        text: `You have made a proposal successfully!`,
                        showConfirmButton: true,
                        timer: 4000
                    })
                }
                else{
                    setDisability(false)
                    Swal.fire({
                        position: 'top-end',
                        icon: 'warning',
                        text: `Sorry, proposal can not have more than 0.005ETH`,
                        showConfirmButton: true,
                        timer: 4000
                    })
                }
                
    
            } catch (error) {
                setDisability(false)
                if(error.message.includes('invalid address')){
                    Swal.fire({
                        position: 'top-end',
                        icon: 'warning',
                        text: `Invalid beneficiary address!`,
                        showConfirmButton: true,
                        timer: 4000
                    })
                }
                console.log(error);
            }   
        }
        else{
            Swal.fire({
                position: 'top-end',
                icon: 'warning',
                text: `You are not a stakeholder!`,
                showConfirmButton: true,
                timer: 4000
            })
        }
       
    }

    const proposals =async()=>{
        try {
            const provider = new ethers.BrowserProvider(connect)            
            const wallet = new Wallet(PRIVATE_KEY, provider);
            const contract = new ethers.Contract(ADDRESS,ABI,wallet)
            const proposals = await contract.getAllProposals()
            const data = await Promise.all(await proposals.map( e =>{
                let info = {
                    id : e.id.toString(),
                    title : e.title,
                    description : e.description,
                    amount : formatEther(e.amount),
                    beneficiary : e.beneficiary,
                    upVote : e.upVote.toString(),
                    downVote : e.downVotes.toString(),
                    paid : e.paid,
                    btnDisability : e.paid

                }

                return info
            }))

            setProposalsData(data)

        } catch (error) {
            console.log(error);
        }
    }

    const voting =async(proposalId,vote)=>{
        try {
            const provider = new ethers.BrowserProvider(connect)            
            const wallet = new Wallet(PRIVATE_KEY, provider);
            const contract = new ethers.Contract(ADDRESS,ABI,wallet)
            const tx = await contract.performVote(proposalId,vote)
            await tx.wait(1)

        } catch (error) {
            if(error.message.includes('Time has already passed')){
                Swal.fire({
                    position: 'top-end',
                    icon: 'warning',
                    text: `Sorry, voting time has ended`,
                    showConfirmButton: true,
                    timer: 4000
                })
            }
            else if (error.message.includes('double voting is not allowed')) {
                Swal.fire({
                    position: 'top-end',
                    icon: 'warning',
                    text: `You have already voted!`,
                    showConfirmButton: true,
                    timer: 4000
                })
            }
            else{
                console.log(error);
            }
        }
    }

    const payBeneficiary =async(proposalId)=>{
        try {
            const provider = new ethers.BrowserProvider(connect)            
            const wallet = new Wallet(PRIVATE_KEY, provider);
            const contract = new ethers.Contract(ADDRESS,ABI,wallet)
            const tx = await contract.payBeneficiary(proposalId)
            await tx.wait(1)
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                text: `Payment made successfully!`,
                showConfirmButton: true,
                timer: 4000
            })

        } catch (error) {
            if(error.message.includes('insufficient votes')){
                Swal.fire({
                    position: 'top-end',
                    icon: 'warning',
                    text: `Sorry, insufficient votes`,
                    showConfirmButton: true,
                    timer: 4000
                })
            }
            else if(error.message.includes('Time has already passed')){
                Swal.fire({
                    position: 'top-end',
                    icon: 'warning',
                    text: `Sorry, voting time has ended`,
                    showConfirmButton: true,
                    timer: 4000
                })
            }
            else if (error.message.includes('double voting is not allowed')) {
                Swal.fire({
                    position: 'top-end',
                    icon: 'warning',
                    text: `You have already voted!`,
                    showConfirmButton: true,
                    timer: 4000
                })
            }
        }
    }

    useEffect(()=>{
        connectWallet()
        getDeployer()
      },[account,deployer])
    
      useEffect(()=>{
        getContributorStatus()
        getStakeholderStatus()
      },[getContributorStatus,getStakeholderStatus])
    
      useEffect(()=>{
        getTotalBalance()
        getStakeholderBalance()
        getContributorBalance()
        proposals()
      },[getTotalBalance,getStakeholderBalance,getContributorBalance,proposals])
    return(
        <GOVERNANCE_CONTEXT.Provider
        
        value={
           { 
            connectWallet,
            account,
            setAmount,
            Contribute,
            disability,
            getTotalBalance,
            totalBalance,
            getStakeholderBalance,
            stakeholderBalance,
            getContributorBalance,
            contributorBalance,
            getContributorStatus,
            getStakeholderStatus,
            contributorStatus,
            stakeholderStatus,
            setFormData,
            propose,
            formData,
            proposals,
            proposalsData,
            voting,
            payBeneficiary,
            getDeployer,
            deployer
        }
        }
        >
        {children}
        </GOVERNANCE_CONTEXT.Provider>
    )
}

module.exports = {
    GOVERNANCE_CONTEXT,
    Government_provider
}