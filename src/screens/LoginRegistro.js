 	 	
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { auth, storage, db } from '../firebase.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fontsource/poetsen-one';

import '../styles/logincadastro.css';
import IconSoloMeetTEA from '../icons/icon-solo-meet-tea.png';
import animalogin from '../img/animalogin.gif';

const LoginRegistro = (props) => {
    const [containerLogar, setContainerLogar] = useState(true);
    const [aceitouTermos, setAceitouTermos] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [user, setUser] = useState(null);
    const [tentativas, setTentativas] = useState(0);
    const [bloqueioAtivo, setBloqueioAtivo] = useState(false);
    const [tempoRestante, setTempoRestante] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                const userDoc = await db.collection('users').doc(authUser.uid).get();
                
                if (!userDoc.exists || !userDoc.data().validated) {
                    toast.error('Sua conta ainda não foi validada por um administrador.');
                    await auth.signOut();
                    setUser(null);
                    localStorage.removeItem('user');
                    return;
                }
    
                setUser(authUser);
                props.setUser(authUser.displayName);
                localStorage.setItem('user', JSON.stringify(authUser));
                navigate('/home');
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
        });
    
        return () => unsubscribe();
    }, [navigate, props]);
    

    useEffect(() => {
        if (bloqueioAtivo) {
            setTempoRestante(180); 

            const timer = setInterval(() => {
                setTempoRestante(prev => {
                    if (prev <= 1) {
                        setTentativas(0);
                        setBloqueioAtivo(false);
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [bloqueioAtivo]);

    const criarConta = async (e) => {
        e.preventDefault();
    
        if (!aceitouTermos) {
            toast.error('Você precisa aceitar os termos para criar uma conta.');
            return;
        }
    
        const birthdateElement = document.getElementById("birthdate-cadastro");
        const emailElement = document.getElementById("email-cadastro");
        const passwordElement = document.getElementById("password-cadastro");
        const userNameElement = document.getElementById("userName-cadastro");
        const socialNameElement = document.getElementById("socialName-cadastro");
        const preferredLanguageElement = document.getElementById("preferredLanguage-cadastro");
        const genderElement = document.getElementById("gender-cadastro");
        const phoneElement = document.getElementById("phone-cadastro");
        const addressElement = document.getElementById("address-cadastro");
        const streetElement = document.getElementById("street-cadastro");
    const numberElement = document.getElementById("number-cadastro");
    const cityElement = document.getElementById("city-cadastro");
    const stateElement = document.getElementById("state-cadastro");
    const cipteaFileElement = document.getElementById("file-cadastro");

    let userName = userNameElement.value;
    let socialName = socialNameElement.value || null; // Opcional
    let email = emailElement.value;
    let password = passwordElement.value;
    let birthDate = birthdateElement.value;
    let idade = calcularIdade(birthDate);
    let gender = genderElement.value;
    let preferredLanguage = preferredLanguageElement.value || "Português Brasileiro";
    let phone = phoneElement.value;
    let street = streetElement.value;
    let number = numberElement.value;
    let city = cityElement.value;
    let state = stateElement.value;
    let address = `${street}, ${number}, ${city}, ${state}`;
    let cipteaFile = cipteaFileElement.files[0];

    
    
    if (!userName) {
        toast.error('Por favor, insira seu nome de usuário.');
            return;
        }
        if (!email) {
            toast.error('Por favor, insira um endereço de e-mail.');
            return;
        }
        if (!email.includes("@")) {
            toast.error('Por favor, insira um endereço de e-mail válido.');
            return;
        }
        if (idade < 16 || idade > 124) {
            toast.error('Você precisa ter entre 16 anos ou mais para criar uma conta.');
            return;
        }
        if (!gender) {
            toast.error('Por favor, selecione seu gênero.');
            return;
        }
        if (!address) {
            toast.error('Por favor, insira seu endereço.');
            return;
        }
        if (!street || !number || !city || !state) {
            toast.error('Por favor, preencha todos os campos do endereço.');
            return;
        }
        if (!/^\d+$/.test(number)) {
            toast.error('O campo "Número" deve conter apenas números.');
            return;
        }
    
        if (!cipteaFile) {
            toast.error("Por favor, faça o upload da carteira CIPTEA.");
            return;
        }
    
        try {
            const authUser = await auth.createUserWithEmailAndPassword(email, password);
            toast.success("Conta criada com Sucesso!");
    
            await authUser.user.updateProfile({
                displayName: userName
            });

            const cipteaFileRef = storage.ref().child(`user_files/${authUser.user.uid}/ciptea_${cipteaFile.name}`);
    
            await cipteaFileRef.put(cipteaFile);
    
            const cipteaURL = await cipteaFileRef.getDownloadURL();
    
            await db.collection('users').doc(authUser.user.uid).set({
                email: authUser.user.email,
                displayName: userName,
                socialName,
                preferredLanguage,
                birthDate,
                gender,
                phone,
                address,
                cipteaURL,
                idade,
                validated: false, 
            });
    
            toast.info('Sua conta foi criada, mas você só poderá acessar após a validação da carteira CIPTEA por um administrador.');
            await auth.signOut(); 
        } catch (error) {
            toast.error('Erro ao criar uma conta. Por favor, tente novamente.');
        }
    };
    
    const logar = async (e) => {
        e.preventDefault();
    
        if (bloqueioAtivo) {
            toast.error(`Você pode tentar novamente em ${Math.floor(tempoRestante / 60)}:${('0' + (tempoRestante % 60)).slice(-2)}`);
            return;
        }
    
        let email = document.getElementById("email-login").value;
        let password = document.getElementById("password-login").value;
    
        try {
            const authResult = await auth.signInWithEmailAndPassword(email, password);
            const userDoc = await db.collection('users').doc(authResult.user.uid).get();
    
            if (!userDoc.exists) {
                toast.error('Usuário não encontrado.');
                await auth.signOut();
                return;
            }
    
            const userData = userDoc.data();
    
            if (userData.banned) {
                toast.error('Sua conta foi banida. Fale com algum ADM.');
                await auth.signOut();
                return;
            }
    
            if (!userData.validated) {
                toast.error('Sua conta ainda não foi validada por um administrador.');
                await auth.signOut();
                return;
            }
    
            props.setUser(authResult.user.displayName);
            toast.success('Logado com Sucesso!');
            localStorage.setItem('user', JSON.stringify(authResult.user));
            navigate('/home');
        } catch (error) {
            setTentativas(prev => {
                const novaTentativa = prev + 1;
                if (novaTentativa >= 3) {
                    setBloqueioAtivo(true);
                    toast.error('Você excedeu o número de tentativas. Você pode tentar novamente em 3 minutos.');
                } else {
                    toast.error('Erro ao logar, tente novamente.');
                }
                return novaTentativa;
            });
        }
    };
    

    const calcularIdade = (birthDate) => {
        const hoje = new Date();
        const nascimento = new Date(birthDate);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();

        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return idade;
    };

    const enviarEmailRedefinicaoSenha = (e) => {
        e.preventDefault();

        auth.sendPasswordResetEmail(resetEmail)
            .then(() => {
                toast.success('E-mail de redefinição de senha enviado!');
                setShowResetPassword(false);
            })
            .catch((error) => toast.error('Erro ao enviar e-mail de redefinição de senha: '));
    };

    return (
        <div className="App">
            <div className="gif">
                <img src={animalogin} width={550} height={550} alt="..." />
            </div>
            <div className="main">
                {containerLogar ? (
                    <div className="main-container-login">
                        <h1 style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={IconSoloMeetTEA} width={55} style={{ margin: '0 10px' }} />MEET TEA <img style={{ margin: '0 10px' }} src={IconSoloMeetTEA} width={55} />
                        </h1>
                        <input type="email" placeholder="User@gmail.com" id="email-login" />
                        <input type="password" id="password-login" placeholder="Senha" />
                        <button onClick={logar}>Iniciar Sessão</button>
                        {bloqueioAtivo && (
                            <div>
                                <p style={{ color: 'red' }}>Você está bloqueado. Tente novamente em {Math.floor(tempoRestante / 60)}:{('0' + (tempoRestante % 60)).slice(-2)}</p>
                            </div>
                        )}
                        <p onClick={() => setShowResetPassword(true)} style={{ cursor: 'pointer', color: 'blue' }}>Esqueci a senha</p>
                        <p>Não tem uma Conta? <span onClick={() => setContainerLogar(!containerLogar)}>Registrar-se</span></p>
                    </div>
                ) : (
                    <div className="main-container-registro">
                        <h1 style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={IconSoloMeetTEA} width={40} style={{ margin: '0 10px' }} />MEET TEA <img src={IconSoloMeetTEA} width={40} style={{ margin: '0 10px' }} />
                        </h1>
                        <input type="text" id="userName-cadastro" placeholder="Nome de usuário" required />
                        <input type="text" id="socialName-cadastro" placeholder="Nome Social (opcional)" />
                        <input type="email" placeholder="User@gmail.com" id="email-cadastro" required />
                        <input type="password" id="password-cadastro" placeholder="Senha" required />
                        <input type="date" id="birthdate-cadastro" placeholder="Data de Nascimento" required />
                        <select id="gender-cadastro" required>
                            <option value="">Diga seu gênero</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
<select id="preferredLanguage-cadastro">
    <option value="">Idioma preferido</option>
    <option value="Português Brasileiro" defaultValue>Português Brasileiro</option>
    <option value="Inglês">Inglês</option>
    <option value="Espanhol">Espanhol</option>
</select>
                        <input type="text" id="phone-cadastro" placeholder="Telefone" />
                        <input type="text" id="street-cadastro" placeholder="Rua" required />
<input type="text" id="number-cadastro" placeholder="Número" required />
<input type="text" id="city-cadastro" placeholder="Cidade" required />
<input type="text" id="state-cadastro" placeholder="Estado" required />

                        <label>Carteira CIPTEA - Para usar o Meet TEA é necessário uma carteira CIPTEA válida, após avaliação de veracidade, seu acesso será aprovado</label>
                        <input type="file" id="file-cadastro" required />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input style={{ width: '10px', marginRight: '20px' }}
                                type="checkbox"
                                id="aceitou-termos"
                                checked={aceitouTermos}
                                onChange={(e) => setAceitouTermos(e.target.checked)} />
                           <label htmlFor="aceitou-termos" style={{marginBottom: '10px'}}>
                                Ao submeter esse formulário, declaro que li e entendi que o tratamento de dados pessoais será realizado nos termos de <a href="/termos-privacidade">Política de Privacidade </a> Meet TEA
                            </label>
                        </div>
                        <button onClick={criarConta}>Registrar-se</button>
                        <p>Já tem uma Conta? <span onClick={() => setContainerLogar(!containerLogar)}>Iniciar Sessão</span></p>
                    </div>
                )}

                {showResetPassword && (
                    <div className="reset-password-modal">
                        <div className="reset-password-content">
                            <h3 style={{color:"white"}}>Redefinir senha</h3>
                            <input id="filtro" type="email" placeholder="Digite seu e-mail" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
                            <br></br><br></br>
                            <button id="btn-curtir" onClick={enviarEmailRedefinicaoSenha}>Enviar E-mail</button>
                            <button id="btn-curtir" onClick={() => setShowResetPassword(false)}>Cancelar</button>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default LoginRegistro;
